import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { connectionManager } from '../ssh/connection-manager'
import { mapSshError } from '../ssh/errors'
import { directoryListingCache } from '../sftp/directory-cache'
import { listRemoteDirectoryCached } from '../sftp/list-cached'
import {
  createRemoteFile,
  deleteRemoteEntry,
  mkdirRemoteDirectory,
  renameRemoteEntry,
} from '../sftp/mutations'
import { readRemoteFile } from '../sftp/read'
import { writeRemoteFile } from '../sftp/write'
import { getRemoteParent, joinRemotePath } from '../sftp/paths'
import { unzipRemoteArchive } from '../sftp/unzip-remote'

export function registerSftpIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.SFTP_LIST, (_event, serverId: string, path: string) =>
    Promise.resolve()
      .then(async () => {
        const sftp = connectionManager.getSftp(serverId)
        return listRemoteDirectoryCached(sftp, serverId, path)
      })
      .catch((error) => {
        throw new Error(mapSshError(error))
      }),
  )

  ipcMain.handle(IPC_CHANNELS.SFTP_READ_FILE, (_event, serverId: string, path: string) =>
    Promise.resolve()
      .then(async () => {
        const sftp = connectionManager.getSftp(serverId)
        return readRemoteFile(sftp, path)
      })
      .catch((error) => {
        throw new Error(mapSshError(error))
      }),
  )

  ipcMain.handle(IPC_CHANNELS.SFTP_WRITE_FILE, (
    _event,
    serverId: string,
    path: string,
    content: string,
  ) =>
    Promise.resolve()
      .then(async () => {
        const sftp = connectionManager.getSftp(serverId)
        await writeRemoteFile(sftp, path, content)
      })
      .catch((error) => {
        throw new Error(mapSshError(error))
      }),
  )

  ipcMain.handle(
    IPC_CHANNELS.SFTP_MKDIR,
    (_event, serverId: string, parentPath: string, name: string) =>
      Promise.resolve()
        .then(async () => {
          const sftp = connectionManager.getSftp(serverId)
          const targetPath = joinRemotePath(parentPath, name)
          await mkdirRemoteDirectory(sftp, targetPath)
          directoryListingCache.invalidate(serverId, parentPath)
          return targetPath
        })
        .catch((error) => {
          throw new Error(mapSshError(error))
        }),
  )

  ipcMain.handle(
    IPC_CHANNELS.SFTP_CREATE_FILE,
    (_event, serverId: string, parentPath: string, name: string) =>
      Promise.resolve()
        .then(async () => {
          const sftp = connectionManager.getSftp(serverId)
          const targetPath = await createRemoteFile(sftp, parentPath, name)
          directoryListingCache.invalidate(serverId, parentPath)
          return targetPath
        })
        .catch((error) => {
          throw new Error(mapSshError(error))
        }),
  )

  ipcMain.handle(
    IPC_CHANNELS.SFTP_RENAME,
    (_event, serverId: string, fromPath: string, toPath: string) =>
      Promise.resolve()
        .then(async () => {
          const sftp = connectionManager.getSftp(serverId)
          await renameRemoteEntry(sftp, fromPath, toPath)
          directoryListingCache.invalidate(serverId, getRemoteParent(fromPath))
          directoryListingCache.invalidate(serverId, getRemoteParent(toPath))
        })
        .catch((error) => {
          throw new Error(mapSshError(error))
        }),
  )

  ipcMain.handle(
    IPC_CHANNELS.SFTP_DELETE,
    (_event, serverId: string, path: string, type: 'file' | 'directory') =>
      Promise.resolve()
        .then(async () => {
          const sftp = connectionManager.getSftp(serverId)
          await deleteRemoteEntry(sftp, path, type)
          if (type === 'directory') {
            directoryListingCache.clear(serverId)
          } else {
            directoryListingCache.invalidate(serverId, getRemoteParent(path))
          }
        })
        .catch((error) => {
          throw new Error(mapSshError(error))
        }),
  )

  ipcMain.handle(IPC_CHANNELS.SFTP_UNZIP, (_event, serverId: string, zipPath: string) =>
    Promise.resolve()
      .then(() => unzipRemoteArchive(serverId, zipPath))
      .catch((error) => {
        throw new Error(mapSshError(error))
      }),
  )
}
