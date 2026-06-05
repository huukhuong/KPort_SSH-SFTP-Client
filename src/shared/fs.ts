export interface LocalFileEntry {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  modifiedAt?: string
}

export interface LocalPathsInfo {
  rootPath: string
  homePath: string
}
