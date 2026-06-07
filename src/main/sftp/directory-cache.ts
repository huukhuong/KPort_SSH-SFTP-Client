import type { RemoteFileEntry } from '../../shared/sftp'

function normalizeCachePath(path: string): string {
  if (!path || path === '/') return '/'
  return path.replace(/\/$/, '') || '/'
}

function buildKey(serverId: string, path: string): string {
  return `${serverId}:${normalizeCachePath(path)}`
}

class DirectoryListingCache {
  private entries = new Map<string, RemoteFileEntry[]>()

  get(serverId: string, path: string): RemoteFileEntry[] | undefined {
    return this.entries.get(buildKey(serverId, path))
  }

  set(serverId: string, path: string, entries: RemoteFileEntry[]): void {
    this.entries.set(buildKey(serverId, path), entries)
  }

  invalidate(serverId: string, path: string): void {
    this.entries.delete(buildKey(serverId, path))
  }

  clear(serverId: string): void {
    const prefix = `${serverId}:`
    for (const key of this.entries.keys()) {
      if (key.startsWith(prefix)) {
        this.entries.delete(key)
      }
    }
  }
}

export const directoryListingCache = new DirectoryListingCache()
