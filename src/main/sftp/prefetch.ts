import { connectionManager } from '../ssh/connection-manager'
import { directoryListingCache } from './directory-cache'
import { listRemoteDirectoryCached } from './list-cached'

const PREFETCH_MAX_DEPTH = 2
const PREFETCH_MAX_LISTINGS = 64
const PREFETCH_CONCURRENCY = 8

const SKIP_ROOT_DIRS = new Set([
  'proc',
  'sys',
  'dev',
  'run',
  'tmp',
  'snap',
  'boot',
  'lost+found',
])

function normalizeSeedPath(path: string): string {
  if (!path || path === '/') return '/'
  return path.replace(/\/$/, '') || '/'
}

function shouldPrefetchDirectory(name: string, parentPath: string): boolean {
  if (name === '.' || name === '..') return false
  if (name.startsWith('.')) return false
  if (parentPath === '/' && SKIP_ROOT_DIRS.has(name)) return false
  return true
}

interface PrefetchTask {
  path: string
  depth: number
}

export async function prefetchRemoteTree(serverId: string, homePath: string): Promise<void> {
  directoryListingCache.clear(serverId)

  const sftp = connectionManager.getSftp(serverId)
  const seeds = Array.from(
    new Set([normalizeSeedPath(homePath), '/'].map(normalizeSeedPath)),
  )

  const visited = new Set<string>()
  const queue: PrefetchTask[] = seeds.map((path) => ({ path, depth: 0 }))
  let listingCount = 0

  while (queue.length > 0 && listingCount < PREFETCH_MAX_LISTINGS) {
    const batch = queue.splice(0, PREFETCH_CONCURRENCY)

    await Promise.all(
      batch.map(async ({ path, depth }) => {
        if (visited.has(path) || listingCount >= PREFETCH_MAX_LISTINGS) return
        visited.add(path)

        try {
          const entries = await listRemoteDirectoryCached(sftp, serverId, path)
          listingCount += 1

          if (depth >= PREFETCH_MAX_DEPTH) return

          for (const entry of entries) {
            if (entry.type !== 'directory') continue
            if (!shouldPrefetchDirectory(entry.name, path)) continue
            if (visited.has(entry.path)) continue
            queue.push({ path: entry.path, depth: depth + 1 })
          }
        } catch {
          // Skip unreadable directories during background prefetch.
        }
      }),
    )
  }
}
