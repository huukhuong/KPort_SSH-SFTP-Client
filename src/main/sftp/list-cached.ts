import type { SFTPWrapper } from 'ssh2'
import type { RemoteFileEntry } from '../../shared/sftp'
import { directoryListingCache } from './directory-cache'
import { listRemoteDirectory } from './list'

const inflight = new Map<string, Promise<RemoteFileEntry[]>>()

function buildInflightKey(serverId: string, path: string): string {
  const normalized = path.replace(/\/$/, '') || '/'
  return `${serverId}:${normalized}`
}

export function listRemoteDirectoryCached(
  sftp: SFTPWrapper,
  serverId: string,
  path: string,
): Promise<RemoteFileEntry[]> {
  const cached = directoryListingCache.get(serverId, path)
  if (cached) {
    return Promise.resolve(cached)
  }

  const inflightKey = buildInflightKey(serverId, path)
  const pending = inflight.get(inflightKey)
  if (pending) {
    return pending
  }

  const promise = listRemoteDirectory(sftp, path)
    .then((entries) => {
      directoryListingCache.set(serverId, path, entries)
      return entries
    })
    .finally(() => {
      inflight.delete(inflightKey)
    })

  inflight.set(inflightKey, promise)
  return promise
}
