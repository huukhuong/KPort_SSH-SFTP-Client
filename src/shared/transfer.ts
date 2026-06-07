export type TransferDirection = 'upload' | 'download'

export type TransferStatus = 'queued' | 'active' | 'completed' | 'failed' | 'cancelled'

export interface TransferJobInput {
  id: string
  serverId: string
  localPath: string
  remotePath: string
}

export interface TransferProgressEvent {
  id: string
  progress: number
  bytesTransferred: number
  totalBytes: number
}

export interface TransferStateEvent {
  id: string
}

export interface TransferFailedEvent {
  id: string
  error: string
}
