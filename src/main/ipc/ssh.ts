import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import type { ServerFormInput } from '../../shared/server'
import { connectionManager } from '../ssh/connection-manager'
import { mapSshError } from '../ssh/errors'

function wrapHandler<T>(handler: () => Promise<T> | T): Promise<T> {
  return Promise.resolve()
    .then(handler)
    .catch((error) => {
      throw new Error(mapSshError(error))
    })
}

export function registerSshIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.SSH_CONNECT, (_event, serverId: string) =>
    wrapHandler(async () => {
      const result = await connectionManager.connect(serverId)
      return { serverId, homePath: result.homePath }
    }),
  )

  ipcMain.handle(IPC_CHANNELS.SSH_DISCONNECT, (_event, serverId: string) =>
    wrapHandler(() => connectionManager.disconnect(serverId)),
  )

  ipcMain.handle(IPC_CHANNELS.SSH_TEST, (_event, input: ServerFormInput) =>
    wrapHandler(() => connectionManager.test(input)),
  )

  ipcMain.handle(IPC_CHANNELS.SSH_GET_STATUS, (_event, serverId: string) =>
    wrapHandler(() => connectionManager.getStatus(serverId)),
  )
}
