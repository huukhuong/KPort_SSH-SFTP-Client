import { readdir, stat } from 'fs/promises'
import { homedir } from 'os'
import { join, resolve } from 'path'
import type { LocalFileEntry, LocalPathsInfo } from '../../shared/fs'

function sortEntries(entries: LocalFileEntry[]): LocalFileEntry[] {
  return [...entries].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

export function getLocalPaths(): LocalPathsInfo {
  return {
    rootPath: process.platform === 'win32' ? `${process.env.SystemDrive ?? 'C:'}\\` : '/',
    homePath: homedir(),
  }
}

export async function listLocalDirectory(dirPath: string): Promise<LocalFileEntry[]> {
  const resolved = resolve(dirPath)
  const dirents = await readdir(resolved, { withFileTypes: true })

  const entries: LocalFileEntry[] = []

  for (const dirent of dirents) {
    if (dirent.name === '.' || dirent.name === '..') continue

    const fullPath = join(resolved, dirent.name)
    const isDirectory = dirent.isDirectory()
    let size: number | undefined
    let modifiedAt: string | undefined

    try {
      const stats = await stat(fullPath)
      if (!isDirectory) size = stats.size
      modifiedAt = stats.mtime.toISOString()
    } catch {
      // Skip metadata when the entry is not readable.
    }

    entries.push({
      name: dirent.name,
      path: fullPath,
      type: isDirectory ? 'directory' : 'file',
      size,
      modifiedAt,
    })
  }

  return sortEntries(entries)
}
