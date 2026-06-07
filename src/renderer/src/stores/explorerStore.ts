import { create } from 'zustand'
import { mockLocalFilesystemRoot, mockRemoteFilesystemRoot } from '../mocks/fileTree'
import { normalizeExplorerPath } from '../utils/fileTree'

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
  localListingRefreshToken: number
  remoteListingRefreshToken: number
  bumpLocalListingRefresh: () => void
  bumpRemoteListingRefresh: () => void
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

  navigateLocal: (path) =>
    set({
      localPath: normalizeExplorerPath(path),
      selectedLocalPath: normalizeExplorerPath(path),
    }),

  navigateRemote: (path) =>
    set({
      remotePath: normalizeExplorerPath(path),
      selectedRemotePath: normalizeExplorerPath(path),
    }),

  setRemoteHome: (path) => set({ remoteHomePath: path }),
  selectLocal: (path) => set({ selectedLocalPath: path }),
  selectRemote: (path) => set({ selectedRemotePath: path }),
  localListingRefreshToken: 0,
  remoteListingRefreshToken: 0,
  bumpLocalListingRefresh: () =>
    set((state) => ({ localListingRefreshToken: state.localListingRefreshToken + 1 })),
  bumpRemoteListingRefresh: () =>
    set((state) => ({ remoteListingRefreshToken: state.remoteListingRefreshToken + 1 })),
}))

export { mockLocalFilesystemRoot, mockRemoteFilesystemRoot }
