import { writeFile } from 'fs/promises'
import { resolve } from 'path'
import { EDITOR_MAX_FILE_BYTES } from '../../shared/editor'

export async function writeLocalFile(filePath: string, content: string): Promise<void> {
  const resolved = resolve(filePath)
  const bytes = Buffer.byteLength(content, 'utf8')

  if (bytes > EDITOR_MAX_FILE_BYTES) {
    throw new Error(`File content is too large to save (max ${EDITOR_MAX_FILE_BYTES / 1024 / 1024} MB)`)
  }

  await writeFile(resolved, content, 'utf8')
}
