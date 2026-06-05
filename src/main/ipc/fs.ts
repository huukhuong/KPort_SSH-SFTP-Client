import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { getLocalPaths, listLocalDirectory } from '../fs/list'

function mapFsError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  const lower = message.toLowerCase()

  if (lower.includes('enoent')) return 'Directory not found'
  if (lower.includes('eacces') || lower.includes('eperm')) return 'Permission denied'
  if (lower.includes('enotdir')) return 'Not a directory'

  return message
}

export function registerFsIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.FS_GET_PATHS, () => getLocalPaths())

  ipcMain.handle(IPC_CHANNELS.FS_LIST, async (_event, path: string) => {
    try {
      return await listLocalDirectory(path)
    } catch (error) {
      throw new Error(mapFsError(error))
    }
  })
}
