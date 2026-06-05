import type { SFTPWrapper } from 'ssh2'
import { EDITOR_MAX_FILE_BYTES } from '../../shared/editor'

export function writeRemoteFile(
  sftp: SFTPWrapper,
  remotePath: string,
  content: string,
): Promise<void> {
  const buffer = Buffer.from(content, 'utf8')

  if (buffer.byteLength > EDITOR_MAX_FILE_BYTES) {
    return Promise.reject(
      new Error(`File content is too large to save (max ${EDITOR_MAX_FILE_BYTES / 1024 / 1024} MB)`),
    )
  }

  return new Promise((resolve, reject) => {
    sftp.writeFile(remotePath, buffer, (error) => {
      if (error) {
        reject(error)
        return
      }

      resolve()
    })
  })
}
