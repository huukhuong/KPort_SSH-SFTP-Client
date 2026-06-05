import type { SFTPWrapper } from 'ssh2'
import { EDITOR_MAX_FILE_BYTES } from '../../shared/editor'

export function readRemoteFile(sftp: SFTPWrapper, remotePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    sftp.stat(remotePath, (statError, stats) => {
      if (statError || !stats) {
        reject(statError ?? new Error('Failed to read remote file metadata'))
        return
      }

      if (stats.size > EDITOR_MAX_FILE_BYTES) {
        reject(
          new Error(`File is too large to open (max ${EDITOR_MAX_FILE_BYTES / 1024 / 1024} MB)`),
        )
        return
      }

      sftp.readFile(remotePath, (readError, data) => {
        if (readError || !data) {
          reject(readError ?? new Error('Failed to read remote file'))
          return
        }

        resolve(data.toString('utf8'))
      })
    })
  })
}
