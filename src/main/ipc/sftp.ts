import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { connectionManager } from '../ssh/connection-manager'
import { mapSshError } from '../ssh/errors'
import { listRemoteDirectory } from '../sftp/list'

export function registerSftpIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.SFTP_LIST, (_event, serverId: string, path: string) =>
    Promise.resolve()
      .then(async () => {
        const sftp = connectionManager.getSftp(serverId)
        return listRemoteDirectory(sftp, path)
      })
      .catch((error) => {
        throw new Error(mapSshError(error))
      }),
  )
}
