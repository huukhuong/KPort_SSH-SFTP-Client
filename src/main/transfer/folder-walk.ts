import { readdir, stat } from 'fs/promises'
import { dirname, join, relative } from 'path'
import { posix } from 'path'
import type { SFTPWrapper } from 'ssh2'
import {
  TRANSFER_FOLDER_MAX_DEPTH,
  TRANSFER_FOLDER_MAX_FILES,
} from '../../shared/transfer'
import { listRemoteDirectory } from '../sftp/list'

export interface WalkedFile {
  absolutePath: string
  relativePath: string
  size: number
}

export interface FolderWalkLimits {
  maxDepth?: number
  maxFiles?: number
}

function normalizeLimits(limits?: FolderWalkLimits) {
  return {
    maxDepth: limits?.maxDepth ?? TRANSFER_FOLDER_MAX_DEPTH,
    maxFiles: limits?.maxFiles ?? TRANSFER_FOLDER_MAX_FILES,
  }
}

export async function walkLocalDirectory(
  rootPath: string,
  limits?: FolderWalkLimits,
): Promise<WalkedFile[]> {
  const { maxDepth, maxFiles } = normalizeLimits(limits)
  const files: WalkedFile[] = []

  async function walk(currentPath: string, depth: number): Promise<void> {
    if (depth > maxDepth) {
      throw new Error(`Folder depth exceeds limit (${maxDepth})`)
    }

    const entries = await readdir(currentPath, { withFileTypes: true })

    for (const entry of entries) {
      if (files.length >= maxFiles) {
        throw new Error(`Folder file count exceeds limit (${maxFiles})`)
      }

      const absolutePath = join(currentPath, entry.name)

      if (entry.isDirectory()) {
        await walk(absolutePath, depth + 1)
        continue
      }

      if (!entry.isFile()) continue

      const fileStats = await stat(absolutePath)
      files.push({
        absolutePath,
        relativePath: relative(rootPath, absolutePath),
        size: fileStats.size,
      })
    }
  }

  const rootStats = await stat(rootPath)
  if (!rootStats.isDirectory()) {
    throw new Error('Path is not a directory')
  }

  await walk(rootPath, 0)
  return files
}

export async function walkRemoteDirectory(
  sftp: SFTPWrapper,
  rootPath: string,
  limits?: FolderWalkLimits,
): Promise<WalkedFile[]> {
  const { maxDepth, maxFiles } = normalizeLimits(limits)
  const files: WalkedFile[] = []

  async function walk(currentPath: string, depth: number): Promise<void> {
    if (depth > maxDepth) {
      throw new Error(`Folder depth exceeds limit (${maxDepth})`)
    }

    const entries = await listRemoteDirectory(sftp, currentPath)

    for (const entry of entries) {
      if (files.length >= maxFiles) {
        throw new Error(`Folder file count exceeds limit (${maxFiles})`)
      }

      if (entry.type === 'directory') {
        await walk(entry.path, depth + 1)
        continue
      }

      files.push({
        absolutePath: entry.path,
        relativePath: posix.relative(rootPath, entry.path),
        size: entry.size ?? 0,
      })
    }
  }

  await walk(rootPath, 0)
  return files
}

export function resolveLocalJoinedPath(basePath: string, relativePath: string): string {
  const segments = relativePath.split(/[/\\]/).filter(Boolean)
  return join(basePath, ...segments)
}

export function resolveRemoteJoinedPath(basePath: string, relativePath: string): string {
  const normalizedBase = basePath.replace(/\/$/, '') || '/'
  const normalizedRelative = relativePath.replace(/\\/g, '/')
  if (normalizedBase === '/') {
    return `/${normalizedRelative}`
  }
  return `${normalizedBase}/${normalizedRelative}`
}

export { dirname }
