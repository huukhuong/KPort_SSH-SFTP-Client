import type { FileTreeNode } from '../types/fileTree'
import { normalizeExplorerPath } from '../utils/fileTree'

const LOCAL_SCOPE = 'local'
const cache = new Map<string, FileTreeNode[]>()

function buildKey(scope: string, path: string): string {
  return `${scope}:${normalizeExplorerPath(path)}`
}

export function getCachedDirectory(scope: string, path: string): FileTreeNode[] | undefined {
  return cache.get(buildKey(scope, path))
}

export function setCachedDirectory(scope: string, path: string, entries: FileTreeNode[]): void {
  cache.set(buildKey(scope, path), entries)
}

export function invalidateDirectory(scope: string, path: string): void {
  cache.delete(buildKey(scope, path))
}

export function clearDirectoryCache(scope?: string): void {
  if (!scope) {
    cache.clear()
    return
  }

  const prefix = `${scope}:`
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key)
    }
  }
}

export const directoryCacheScopes = {
  local: LOCAL_SCOPE,
  remote: (serverId: string) => serverId,
} as const
