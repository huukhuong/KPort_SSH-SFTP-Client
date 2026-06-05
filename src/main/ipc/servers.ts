import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import type { ServerFormInput } from '../../shared/server'
import {
  createServer,
  deleteServer,
  listServers,
  toggleServerFavorite,
  updateServer,
} from '../db/servers'
import { connectionManager } from '../ssh/connection-manager'

function wrapHandler<T>(handler: () => T): T {
  try {
    return handler()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    throw new Error(message)
  }
}

export function registerServerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.SERVERS_LIST, () => wrapHandler(() => listServers()))

  ipcMain.handle(IPC_CHANNELS.SERVERS_CREATE, (_event, input: ServerFormInput) =>
    wrapHandler(() => createServer(input)),
  )

  ipcMain.handle(IPC_CHANNELS.SERVERS_UPDATE, (_event, id: string, input: ServerFormInput) =>
    wrapHandler(() => updateServer(id, input)),
  )

  ipcMain.handle(IPC_CHANNELS.SERVERS_DELETE, async (_event, id: string) => {
    try {
      await connectionManager.disconnect(id)
      deleteServer(id)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown server error'
      throw new Error(message)
    }
  })

  ipcMain.handle(IPC_CHANNELS.SERVERS_TOGGLE_FAVORITE, (_event, id: string) =>
    wrapHandler(() => toggleServerFavorite(id)),
  )
}
