import {
  directoryCacheScopes,
  invalidateDirectory,
} from './directoryListingCache'
import { useExplorerStore } from '../stores/explorerStore'
import { useTransferStore } from '../stores/transferStore'
import { getParentExplorerPath, normalizeExplorerPath } from '../utils/fileTree'

export function syncExplorerListingsAfterTransfer(transferId: string): void {
  const job = useTransferStore.getState().transfers.find((item) => item.id === transferId)
  if (!job) return

  const { remotePath, localPath, localRootPath } = useExplorerStore.getState()

  if (job.direction === 'upload') {
    const parent = getParentExplorerPath(job.remotePath, '/') ?? '/'
    invalidateDirectory(directoryCacheScopes.remote(job.serverId), parent)

    if (normalizeExplorerPath(remotePath) === normalizeExplorerPath(parent)) {
      useExplorerStore.getState().bumpRemoteListingRefresh()
    }
    return
  }

  const parent = getParentExplorerPath(job.localPath, localRootPath) ?? localRootPath
  invalidateDirectory(directoryCacheScopes.local, parent)

  if (normalizeExplorerPath(localPath) === normalizeExplorerPath(parent)) {
    useExplorerStore.getState().bumpLocalListingRefresh()
  }
}
