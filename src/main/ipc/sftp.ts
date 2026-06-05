import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { connectionManager } from '../ssh/connection-manager'
import { mapSshError } from '../ssh/errors'
import { listRemoteDirectoryCached } from '../sftp/list-cached'
import { readRemoteFile } from '../sftp/read'
import { writeRemoteFile } from '../sftp/write'

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
}
