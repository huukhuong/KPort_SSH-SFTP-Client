import { readFile, stat } from 'fs/promises'
import { resolve } from 'path'
import { EDITOR_MAX_FILE_BYTES } from '../../shared/editor'

export async function readLocalFile(filePath: string): Promise<string> {
  const resolved = resolve(filePath)
  const stats = await stat(resolved)

  if (!stats.isFile()) {
    throw new Error('Not a file')
  }

  if (stats.size > EDITOR_MAX_FILE_BYTES) {
    throw new Error(`File is too large to open (max ${EDITOR_MAX_FILE_BYTES / 1024 / 1024} MB)`)
  }

  return readFile(resolved, 'utf8')
}
