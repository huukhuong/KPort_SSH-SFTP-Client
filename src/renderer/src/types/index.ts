export type ServerStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export type AuthType = 'password' | 'private_key'

export interface Server {
  id: string
  name: string
  host: string
  port: number
  username: string
  authType: AuthType
  isFavorite: boolean
  status?: ServerStatus
}

export interface FileEntry {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  modifiedAt?: string
}

export interface EditorTab {
  id: string
  path: string
  language: string
  content: string
  isDirty: boolean
}

export type TransferStatus = 'queued' | 'active' | 'completed' | 'failed' | 'cancelled'

export interface TransferJob {
  id: string
  direction: 'upload' | 'download'
  localPath: string
  remotePath: string
  status: TransferStatus
  progress: number
  error?: string
}

export type { ServerMetrics } from '../../../shared/metrics'

export interface FavoriteDirectory {
  id: string
  serverId: string
  path: string
  label: string
}

export interface QuickCommand {
  id: string
  label: string
  command: string
  group?: string
}
