import { createReadStream, createWriteStream } from 'fs'
import { mkdir, stat } from 'fs/promises'
import { BrowserWindow } from 'electron'
import { dirname, posix } from 'path'
import { Transform } from 'stream'
import type { Readable, Writable } from 'stream'
import { pipeline } from 'stream/promises'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import type {
  TransferDirection,
  TransferFailedEvent,
  TransferJobInput,
  TransferProgressEvent,
  TransferStateEvent,
} from '../../shared/transfer'
import { directoryListingCache } from '../sftp/directory-cache'
import { mkdirRemoteDirectory } from '../sftp/mutations'
import { getRemoteParent } from '../sftp/paths'
import { connectionManager } from '../ssh/connection-manager'
import { mapSshError } from '../ssh/errors'
import {
  resolveLocalJoinedPath,
  resolveRemoteJoinedPath,
  walkLocalDirectory,
  walkRemoteDirectory,
} from './folder-walk'

interface QueuedTransfer extends TransferJobInput {
  direction: TransferDirection
}

interface ActiveTransfer extends QueuedTransfer {
  cancelled: boolean
  readStream?: Readable
  writeStream?: Writable
}

interface TransferProgressState {
  bytesTransferred: number
  totalBytes: number
}

const MAX_CONCURRENT = 1

class TransferManager {
  private queue: QueuedTransfer[] = []
  private running = 0
  private activeJobs = new Map<string, ActiveTransfer>()

  upload(input: TransferJobInput): void {
    this.enqueue({ ...input, direction: 'upload' })
  }

  download(input: TransferJobInput): void {
    this.enqueue({ ...input, direction: 'download' })
  }

  cancel(id: string): void {
    const active = this.activeJobs.get(id)
    if (active) {
      active.cancelled = true
      active.readStream?.destroy()
      active.writeStream?.destroy()
      return
    }

    this.queue = this.queue.filter((job) => job.id !== id)
    this.emitCancelled({ id })
  }

  retry(input: TransferJobInput, direction: TransferDirection): void {
    this.enqueue({ ...input, direction })
  }

  private enqueue(job: QueuedTransfer): void {
    this.queue.push(job)
    void this.pump()
  }

  private async pump(): Promise<void> {
    if (this.running >= MAX_CONCURRENT || this.queue.length === 0) return

    const job = this.queue.shift()
    if (!job) return

    this.running += 1
    const active: ActiveTransfer = { ...job, cancelled: false }
    this.activeJobs.set(job.id, active)

    try {
      this.emitStarted({ id: job.id })
      if (job.direction === 'upload') {
        await this.runUpload(active)
      } else {
        await this.runDownload(active)
      }

      if (active.cancelled) {
        this.emitCancelled({ id: job.id })
      } else {
        this.invalidateCaches(job)
        this.emitComplete({ id: job.id })
      }
    } catch (error) {
      if (active.cancelled) {
        this.emitCancelled({ id: job.id })
      } else {
        const message = error instanceof Error ? error.message : String(error)
        this.emitFailed({ id: job.id, error: mapSshError(message) })
      }
    } finally {
      this.activeJobs.delete(job.id)
      this.running -= 1
      void this.pump()
    }
  }

  private invalidateCaches(job: QueuedTransfer): void {
    if (job.direction === 'upload') {
      directoryListingCache.invalidate(job.serverId, getRemoteParent(job.remotePath))
      directoryListingCache.invalidate(job.serverId, job.remotePath)
    }
  }

  private async runUpload(job: ActiveTransfer): Promise<void> {
    const localStats = await stat(job.localPath)
    if (localStats.isDirectory()) {
      await this.runUploadDirectory(job)
      return
    }

    const totalBytes = localStats.size
    const sftp = connectionManager.getSftp(job.serverId)
    const readStream = createReadStream(job.localPath)
    const writeStream = sftp.createWriteStream(job.remotePath)

    job.readStream = readStream
    job.writeStream = writeStream

    const progress: TransferProgressState = { bytesTransferred: 0, totalBytes }
    await this.pipeWithProgress(job, readStream, writeStream, progress)
  }

  private async runUploadDirectory(job: ActiveTransfer): Promise<void> {
    const files = await walkLocalDirectory(job.localPath)
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0)
    const progress: TransferProgressState = { bytesTransferred: 0, totalBytes }
    const sftp = connectionManager.getSftp(job.serverId)

    for (const file of files) {
      if (job.cancelled) return

      const remoteFilePath = resolveRemoteJoinedPath(job.remotePath, file.relativePath)
      await this.ensureRemoteDirectory(sftp, posix.dirname(remoteFilePath))

      const readStream = createReadStream(file.absolutePath)
      const writeStream = sftp.createWriteStream(remoteFilePath)
      job.readStream = readStream
      job.writeStream = writeStream

      await this.pipeWithProgress(job, readStream, writeStream, progress)
    }
  }

  private async runDownload(job: ActiveTransfer): Promise<void> {
    const sftp = connectionManager.getSftp(job.serverId)
    const remoteStats = await this.statRemoteEntry(sftp, job.remotePath)

    if (remoteStats.isDirectory) {
      await this.runDownloadDirectory(job)
      return
    }

    const readStream = sftp.createReadStream(job.remotePath)
    const writeStream = createWriteStream(job.localPath)

    job.readStream = readStream
    job.writeStream = writeStream

    const progress: TransferProgressState = {
      bytesTransferred: 0,
      totalBytes: remoteStats.size,
    }
    await this.pipeWithProgress(job, readStream, writeStream, progress)
  }

  private async runDownloadDirectory(job: ActiveTransfer): Promise<void> {
    const sftp = connectionManager.getSftp(job.serverId)
    const files = await walkRemoteDirectory(sftp, job.remotePath)
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0)
    const progress: TransferProgressState = { bytesTransferred: 0, totalBytes }

    for (const file of files) {
      if (job.cancelled) return

      const localFilePath = resolveLocalJoinedPath(job.localPath, file.relativePath)
      await mkdir(dirname(localFilePath), { recursive: true })

      const readStream = sftp.createReadStream(file.absolutePath)
      const writeStream = createWriteStream(localFilePath)
      job.readStream = readStream
      job.writeStream = writeStream

      await this.pipeWithProgress(job, readStream, writeStream, progress)
    }
  }

  private async ensureRemoteDirectory(sftp: ReturnType<typeof connectionManager.getSftp>, dirPath: string): Promise<void> {
    const normalized = dirPath.replace(/\/$/, '') || '/'
    if (normalized === '/') return

    const parts = normalized.split('/').filter(Boolean)
    let current = '/'

    for (const part of parts) {
      current = current === '/' ? `/${part}` : `${current}/${part}`
      try {
        await mkdirRemoteDirectory(sftp, current)
      } catch {
        // Directory may already exist.
      }
    }
  }

  private statRemoteEntry(
    sftp: ReturnType<typeof connectionManager.getSftp>,
    remotePath: string,
  ): Promise<{ isDirectory: boolean; size: number }> {
    return new Promise((resolve, reject) => {
      sftp.stat(remotePath, (error, stats) => {
        if (error || !stats) {
          reject(error ?? new Error('Failed to read remote path metadata'))
          return
        }

        resolve({
          isDirectory: stats.isDirectory(),
          size: stats.size,
        })
      })
    })
  }

  private async pipeWithProgress(
    job: ActiveTransfer,
    readStream: Readable,
    writeStream: Writable,
    progress: TransferProgressState,
  ): Promise<void> {
    const manager = this
    const progressWithEmit = new Transform({
      transform(chunk, _encoding, callback) {
        progress.bytesTransferred += chunk.length
        const ratio =
          progress.totalBytes > 0 ? progress.bytesTransferred / progress.totalBytes : 1

        manager.emitProgress({
          id: job.id,
          progress: Math.min(100, Math.round(ratio * 100)),
          bytesTransferred: progress.bytesTransferred,
          totalBytes: progress.totalBytes,
        })
        callback(null, chunk)
      },
    })

    await pipeline(readStream, progressWithEmit, writeStream)
  }

  private broadcast(channel: string, payload: unknown): void {
    for (const window of BrowserWindow.getAllWindows()) {
      if (!window.isDestroyed()) {
        window.webContents.send(channel, payload)
      }
    }
  }

  private emitStarted(payload: TransferStateEvent): void {
    this.broadcast(IPC_CHANNELS.TRANSFER_STARTED, payload)
  }

  private emitProgress(payload: TransferProgressEvent): void {
    this.broadcast(IPC_CHANNELS.TRANSFER_PROGRESS, payload)
  }

  private emitComplete(payload: TransferStateEvent): void {
    this.broadcast(IPC_CHANNELS.TRANSFER_COMPLETE, payload)
  }

  private emitFailed(payload: TransferFailedEvent): void {
    this.broadcast(IPC_CHANNELS.TRANSFER_FAILED, payload)
  }

  private emitCancelled(payload: TransferStateEvent): void {
    this.broadcast(IPC_CHANNELS.TRANSFER_CANCELLED, payload)
  }
}

export const transferManager = new TransferManager()
