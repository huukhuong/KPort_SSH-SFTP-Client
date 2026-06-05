import { create } from 'zustand'
import {
  FILESYSTEM_ROOT,
  LOCAL_HOME_PATH,
  mockLocalFilesystemRoot,
  mockRemoteFilesystemRoot,
} from '../mocks/fileTree'

interface ExplorerStore {
  localPath: string
  remotePath: string
  selectedLocalPath: string | null
  selectedRemotePath: string | null
  navigateLocal: (path: string) => void
  navigateRemote: (path: string) => void
  selectLocal: (path: string | null) => void
  selectRemote: (path: string | null) => void
}

export const useExplorerStore = create<ExplorerStore>((set) => ({
  localPath: LOCAL_HOME_PATH,
  remotePath: '/var/www/api',
  selectedLocalPath: null,
  selectedRemotePath: '/var/www/api/.env',

  navigateLocal: (path) => set({ localPath: path, selectedLocalPath: path }),
  navigateRemote: (path) => set({ remotePath: path, selectedRemotePath: path }),
  selectLocal: (path) => set({ selectedLocalPath: path }),
  selectRemote: (path) => set({ selectedRemotePath: path }),
}))

export {
  FILESYSTEM_ROOT,
  LOCAL_HOME_PATH,
  mockLocalFilesystemRoot,
  mockRemoteFilesystemRoot,
}
