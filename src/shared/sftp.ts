export interface RemoteFileEntry {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  modifiedAt?: string
}
