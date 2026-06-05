import { create } from 'zustand'
import { mockLocalFilesystemRoot, mockRemoteFilesystemRoot } from '../mocks/fileTree'

interface ExplorerStore {
  localPath: string
  localHomePath: string
  localRootPath: string
  localPathsReady: boolean
  remotePath: string
  remoteHomePath: string
  selectedLocalPath: string | null
  selectedRemotePath: string | null
  initializeLocalPaths: (homePath: string, rootPath: string) => void
  navigateLocal: (path: string) => void
  navigateRemote: (path: string) => void
  setRemoteHome: (path: string) => void
  selectLocal: (path: string | null) => void
  selectRemote: (path: string | null) => void
}

export const useExplorerStore = create<ExplorerStore>((set) => ({
  localPath: '/',
  localHomePath: '/',
  localRootPath: '/',
  localPathsReady: false,
  remotePath: '/',
  remoteHomePath: '/',
  selectedLocalPath: null,
  selectedRemotePath: null,

  initializeLocalPaths: (homePath, rootPath) =>
    set({
      localHomePath: homePath,
      localRootPath: rootPath,
      localPath: homePath,
      localPathsReady: true,
    }),

  navigateLocal: (path) => set({ localPath: path, selectedLocalPath: path }),
  navigateRemote: (path) => set({ remotePath: path, selectedRemotePath: path }),
  setRemoteHome: (path) => set({ remoteHomePath: path }),
  selectLocal: (path) => set({ selectedLocalPath: path }),
  selectRemote: (path) => set({ selectedRemotePath: path }),
}))

export { mockLocalFilesystemRoot, mockRemoteFilesystemRoot }
