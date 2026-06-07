import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { readLocalFile } from '../fs/read'
import { writeLocalFile } from '../fs/write'
import { getLocalPaths, listLocalDirectory } from '../fs/list'
import {
  createLocalFile,
  deleteLocalEntry,
  mkdirLocalDirectory,
  renameLocalEntry,
} from '../fs/mutations'

function mapFsError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  const lower = message.toLowerCase()

  if (lower.includes('enoent')) return 'Directory not found'
  if (lower.includes('eacces') || lower.includes('eperm')) return 'Permission denied'
  if (lower.includes('enotdir')) return 'Not a directory'
  if (lower.includes('eisdir')) return 'Not a file'
  if (lower.includes('enotempty')) return 'Directory is not empty'
  if (lower.includes('eexist')) return 'A file or folder with that name already exists'

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

  ipcMain.handle(IPC_CHANNELS.FS_READ_FILE, async (_event, path: string) => {
    try {
      return await readLocalFile(path)
    } catch (error) {
      throw new Error(mapFsError(error))
    }
  })

  ipcMain.handle(IPC_CHANNELS.FS_WRITE_FILE, async (_event, path: string, content: string) => {
    try {
      await writeLocalFile(path, content)
    } catch (error) {
      throw new Error(mapFsError(error))
    }
  })

  ipcMain.handle(IPC_CHANNELS.FS_MKDIR, async (_event, parentPath: string, name: string) => {
    try {
      return await mkdirLocalDirectory(parentPath, name)
    } catch (error) {
      throw new Error(mapFsError(error))
    }
  })

  ipcMain.handle(IPC_CHANNELS.FS_CREATE_FILE, async (_event, parentPath: string, name: string) => {
    try {
      return await createLocalFile(parentPath, name)
    } catch (error) {
      throw new Error(mapFsError(error))
    }
  })

  ipcMain.handle(
    IPC_CHANNELS.FS_RENAME,
    async (_event, fromPath: string, toPath: string) => {
      try {
        await renameLocalEntry(fromPath, toPath)
      } catch (error) {
        throw new Error(mapFsError(error))
      }
    },
  )

  ipcMain.handle(
    IPC_CHANNELS.FS_DELETE,
    async (_event, path: string, type: 'file' | 'directory') => {
      try {
        await deleteLocalEntry(path, type)
      } catch (error) {
        throw new Error(mapFsError(error))
      }
    },
  )
}
