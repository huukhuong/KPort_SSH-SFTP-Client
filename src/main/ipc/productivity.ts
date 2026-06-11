import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import type {
  FavoriteDirectoryInput,
  FileSearchInput,
  QuickCommandInput,
} from '../../shared/productivity'
import {
  addFavoriteDirectory,
  listFavoriteDirectories,
  removeFavoriteDirectory,
} from '../db/favorites'
import {
  createQuickCommand,
  deleteQuickCommand,
  listQuickCommands,
  updateQuickCommand,
} from '../db/quickCommands'
import { searchRemoteFiles } from '../ssh/file-search'

function wrapHandler<T>(handler: () => T | Promise<T>): Promise<T> {
  try {
    return Promise.resolve(handler())
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown productivity error'
    return Promise.reject(new Error(message))
  }
}

export function registerProductivityIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.FAVORITES_LIST, (_event, serverId?: string) =>
    wrapHandler(() => listFavoriteDirectories(serverId)),
  )

  ipcMain.handle(IPC_CHANNELS.FAVORITES_ADD, (_event, input: FavoriteDirectoryInput) =>
    wrapHandler(() => addFavoriteDirectory(input)),
  )

  ipcMain.handle(IPC_CHANNELS.FAVORITES_REMOVE, (_event, id: string) =>
    wrapHandler(() => {
      removeFavoriteDirectory(id)
    }),
  )

  ipcMain.handle(IPC_CHANNELS.COMMANDS_LIST, () => wrapHandler(() => listQuickCommands()))

  ipcMain.handle(IPC_CHANNELS.COMMANDS_CREATE, (_event, input: QuickCommandInput) =>
    wrapHandler(() => createQuickCommand(input)),
  )

  ipcMain.handle(IPC_CHANNELS.COMMANDS_UPDATE, (_event, id: string, input: QuickCommandInput) =>
    wrapHandler(() => updateQuickCommand(id, input)),
  )

  ipcMain.handle(IPC_CHANNELS.COMMANDS_DELETE, (_event, id: string) =>
    wrapHandler(() => {
      deleteQuickCommand(id)
    }),
  )

  ipcMain.handle(IPC_CHANNELS.SEARCH_FILES, (_event, input: FileSearchInput) =>
    wrapHandler(() => searchRemoteFiles(input)),
  )
}
