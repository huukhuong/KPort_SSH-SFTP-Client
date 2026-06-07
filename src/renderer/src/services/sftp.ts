import type { RemoteFileEntry } from '../../../shared/sftp'
import type { FileTreeNode } from '../types/fileTree'

function getSftpApi() {
  if (!window.kport?.sftp) {
    throw new Error('KPort SFTP API is not available')
  }

  return window.kport.sftp
}

function toFileTreeNode(entry: RemoteFileEntry): FileTreeNode {
  return {
    name: entry.name,
    path: entry.path,
    type: entry.type,
    size: entry.size,
    modifiedAt: entry.modifiedAt,
  }
}

export async function listRemoteDirectory(serverId: string, path: string): Promise<FileTreeNode[]> {
  const entries = await getSftpApi().list(serverId, path)
  return entries.map(toFileTreeNode)
}

export async function mkdirRemoteDirectory(
  serverId: string,
  parentPath: string,
  name: string,
): Promise<string> {
  return getSftpApi().mkdir(serverId, parentPath, name)
}

export async function createRemoteFile(
  serverId: string,
  parentPath: string,
  name: string,
): Promise<string> {
  return getSftpApi().createFile(serverId, parentPath, name)
}

export async function renameRemoteEntry(
  serverId: string,
  fromPath: string,
  toPath: string,
): Promise<void> {
  await getSftpApi().rename(serverId, fromPath, toPath)
}

export async function deleteRemoteEntry(
  serverId: string,
  path: string,
  type: 'file' | 'directory',
): Promise<void> {
  await getSftpApi().delete(serverId, path, type)
}
