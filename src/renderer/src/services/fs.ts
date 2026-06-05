import type { LocalPathsInfo } from '../../../shared/fs'
import type { FileTreeNode } from '../types/fileTree'

function getFsApi() {
  if (!window.kport?.fs) {
    throw new Error('KPort FS API is not available')
  }

  return window.kport.fs
}

function toFileTreeNode(entry: {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  modifiedAt?: string
}): FileTreeNode {
  return {
    name: entry.name,
    path: entry.path,
    type: entry.type,
    size: entry.size,
    modifiedAt: entry.modifiedAt,
  }
}

export async function getLocalPaths(): Promise<LocalPathsInfo> {
  return getFsApi().getPaths()
}

export async function listLocalDirectory(path: string): Promise<FileTreeNode[]> {
  const entries = await getFsApi().list(path)
  return entries.map(toFileTreeNode)
}
