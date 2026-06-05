import { posix } from 'path'
import type { SFTPWrapper } from 'ssh2'
import type { RemoteFileEntry } from '../../shared/sftp'

function normalizeRemotePath(path: string): string {
  if (!path || path === '/') return '/'
  return path.replace(/\/$/, '') || '/'
}

function joinRemotePath(base: string, name: string): string {
  const normalized = normalizeRemotePath(base)
  if (normalized === '/') return `/${name}`
  return `${normalized}/${name}`
}

function sortEntries(entries: RemoteFileEntry[]): RemoteFileEntry[] {
  return [...entries].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

export function listRemoteDirectory(sftp: SFTPWrapper, path: string): Promise<RemoteFileEntry[]> {
  const remotePath = normalizeRemotePath(path)

  return new Promise((resolve, reject) => {
    sftp.readdir(remotePath, (error, list) => {
      if (error) {
        reject(error)
        return
      }

      const entries: RemoteFileEntry[] = list
        .filter((item) => item.filename !== '.' && item.filename !== '..')
        .map((item) => {
          const attrs = item.attrs
          const isDirectory = (attrs.mode & 0o170000) === 0o040000

          return {
            name: item.filename,
            path: joinRemotePath(remotePath, item.filename),
            type: isDirectory ? 'directory' : 'file',
            size: isDirectory ? undefined : attrs.size,
            modifiedAt: attrs.mtime ? new Date(attrs.mtime * 1000).toISOString() : undefined,
          } satisfies RemoteFileEntry
        })

      resolve(sortEntries(entries))
    })
  })
}
