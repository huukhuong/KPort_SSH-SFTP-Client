import { notifications } from '@mantine/notifications'
import { useCallback } from 'react'
import {
  cancelTransfer,
  createTransferId,
  pickLocalFile,
  retryTransfer,
  startDownload,
  startUpload,
} from '../services/transfer'
import { useBottomPanelStore } from '../stores/bottomPanelStore'
import { useExplorerStore } from '../stores/explorerStore'
import { useServerStore } from '../stores/serverStore'
import { useTransferStore } from '../stores/transferStore'
import type { TransferJob } from '../types'
import { getFileName, joinExplorerEntryPath } from '../utils/fileTree'

function getConnectedServer() {
  const { servers, activeServerId } = useServerStore.getState()
  const server = servers.find((item) => item.id === activeServerId)
  if (!server || server.status !== 'connected') {
    return null
  }
  return server
}

export function useTransferActions() {
  const enqueue = useTransferStore((state) => state.enqueue)

  const uploadLocalFile = useCallback(
    async (localPath: string, remoteDir?: string) => {
      const server = getConnectedServer()
      if (!server) {
        notifications.show({
          title: 'Upload unavailable',
          message: 'Connect to a server first',
          color: 'orange',
        })
        return
      }

      const remoteBase = remoteDir ?? useExplorerStore.getState().remotePath
      const fileName = getFileName(localPath)
      const remotePath = joinExplorerEntryPath(remoteBase, fileName)
      const id = createTransferId()

      const job: TransferJob = {
        id,
        serverId: server.id,
        direction: 'upload',
        localPath,
        remotePath,
        status: 'queued',
        progress: 0,
      }

      enqueue(job)
      useBottomPanelStore.getState().openTransfersTab()

      try {
        await startUpload({
          id,
          serverId: server.id,
          localPath,
          remotePath,
        })
      } catch (error) {
        useTransferStore.getState().markFailed(
          id,
          error instanceof Error ? error.message : 'Upload failed',
        )
      }
    },
    [enqueue],
  )

  const downloadRemoteFile = useCallback(
    async (remotePath: string, localDir?: string) => {
      const server = getConnectedServer()
      if (!server) {
        notifications.show({
          title: 'Download unavailable',
          message: 'Connect to a server first',
          color: 'orange',
        })
        return
      }

      const localBase = localDir ?? useExplorerStore.getState().localPath
      const fileName = getFileName(remotePath)
      const localPath = joinExplorerEntryPath(localBase, fileName)
      const id = createTransferId()

      const job: TransferJob = {
        id,
        serverId: server.id,
        direction: 'download',
        localPath,
        remotePath,
        status: 'queued',
        progress: 0,
      }

      enqueue(job)
      useBottomPanelStore.getState().openTransfersTab()

      try {
        await startDownload({
          id,
          serverId: server.id,
          localPath,
          remotePath,
        })
      } catch (error) {
        useTransferStore.getState().markFailed(
          id,
          error instanceof Error ? error.message : 'Download failed',
        )
      }
    },
    [enqueue],
  )

  const uploadFromPicker = useCallback(async () => {
    try {
      const localPath = await pickLocalFile()
      if (!localPath) return
      await uploadLocalFile(localPath)
    } catch (error) {
      notifications.show({
        title: 'Upload failed',
        message: error instanceof Error ? error.message : 'Could not pick a file',
        color: 'red',
      })
    }
  }, [uploadLocalFile])

  const uploadSelectedOrPick = useCallback(
    async (selectedPath: string | null, entries: { path: string; type: 'file' | 'directory' }[]) => {
      const selected = entries.find((entry) => entry.path === selectedPath && entry.type === 'file')
      if (selected) {
        await uploadLocalFile(selected.path)
        return
      }

      await uploadFromPicker()
    },
    [uploadFromPicker, uploadLocalFile],
  )

  const cancelJob = useCallback(async (id: string) => {
    try {
      await cancelTransfer(id)
    } catch (error) {
      notifications.show({
        title: 'Cancel failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        color: 'red',
      })
    }
  }, [])

  const retryJob = useCallback(
    async (job: TransferJob) => {
      const server = getConnectedServer()
      if (!server) {
        notifications.show({
          title: 'Retry unavailable',
          message: 'Connect to a server first',
          color: 'orange',
        })
        return
      }

      const id = createTransferId()
      enqueue({
        ...job,
        id,
        serverId: server.id,
        status: 'queued',
        progress: 0,
        error: undefined,
      })
      useBottomPanelStore.getState().openTransfersTab()

      try {
        await retryTransfer(
          {
            id,
            serverId: server.id,
            localPath: job.localPath,
            remotePath: job.remotePath,
          },
          job.direction,
        )
      } catch (error) {
        useTransferStore.getState().markFailed(
          id,
          error instanceof Error ? error.message : 'Retry failed',
        )
      }
    },
    [enqueue],
  )

  return {
    uploadLocalFile,
    downloadRemoteFile,
    uploadFromPicker,
    uploadSelectedOrPick,
    cancelJob,
    retryJob,
  }
}
