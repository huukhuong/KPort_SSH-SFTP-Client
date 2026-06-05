export interface FileTreeNode {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  modifiedAt?: string
  children?: FileTreeNode[]
}

export interface PathSegment {
  label: string
  path: string
}
