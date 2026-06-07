import type { SFTPWrapper } from 'ssh2'
import { listRemoteDirectory } from './list'
import { joinRemotePath } from './paths'
import { writeRemoteFile } from './write'

function sftpCallback<T>(resolve: (value: T) => void, reject: (error: Error) => void) {
  return (error?: Error | null, result?: T) => {
    if (error) {
      reject(error)
      return
    }

    resolve(result as T)
  }
}

export function mkdirRemoteDirectory(
  sftp: SFTPWrapper,
  remotePath: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    sftp.mkdir(remotePath, sftpCallback(resolve, reject))
  })
}

export function createRemoteFile(
  sftp: SFTPWrapper,
  parentPath: string,
  name: string,
): Promise<string> {
  const targetPath = joinRemotePath(parentPath, name)
  return writeRemoteFile(sftp, targetPath, '').then(() => targetPath)
}

export function renameRemoteEntry(
  sftp: SFTPWrapper,
  fromPath: string,
  toPath: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    sftp.rename(fromPath, toPath, sftpCallback(resolve, reject))
  })
}

function unlinkRemoteFile(sftp: SFTPWrapper, remotePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    sftp.unlink(remotePath, sftpCallback(resolve, reject))
  })
}

function rmdirRemoteDirectory(sftp: SFTPWrapper, remotePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    sftp.rmdir(remotePath, sftpCallback(resolve, reject))
  })
}

async function deleteRemoteDirectoryRecursive(
  sftp: SFTPWrapper,
  remotePath: string,
): Promise<void> {
  const children = await listRemoteDirectory(sftp, remotePath)

  for (const child of children) {
    if (child.type === 'directory') {
      await deleteRemoteDirectoryRecursive(sftp, child.path)
      continue
    }

    await unlinkRemoteFile(sftp, child.path)
  }

  await rmdirRemoteDirectory(sftp, remotePath)
}

export function deleteRemoteEntry(
  sftp: SFTPWrapper,
  remotePath: string,
  type: 'file' | 'directory',
): Promise<void> {
  if (type === 'file') {
    return unlinkRemoteFile(sftp, remotePath)
  }

  return deleteRemoteDirectoryRecursive(sftp, remotePath)
}
