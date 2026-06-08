export interface RemoteFileEntry {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  modifiedAt?: string
}

export interface RemoteUnzipResult {
  zipPath: string
  extractPath: string
  installedUnzip: boolean
}
