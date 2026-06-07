export interface FavoriteDirectoryRecord {
  id: string
  serverId: string
  path: string
  label: string
  createdAt: string
}

export interface FavoriteDirectoryInput {
  serverId: string
  path: string
  label?: string
}

export interface QuickCommandRecord {
  id: string
  label: string
  command: string
  group?: string
  sortOrder: number
  createdAt: string
}

export interface QuickCommandInput {
  label: string
  command: string
  group?: string
}

export interface FileSearchInput {
  serverId: string
  path: string
  query: string
  maxResults?: number
}

export interface FileSearchResult {
  path: string
  name: string
}

export const FILE_SEARCH_DEFAULT_MAX_RESULTS = 100
export const FILE_SEARCH_TIMEOUT_MS = 30_000
