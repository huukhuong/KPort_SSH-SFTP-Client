import { registerFsIpcHandlers } from './fs'
import { registerServerIpcHandlers } from './servers'
import { registerSftpIpcHandlers } from './sftp'
import { registerSshIpcHandlers } from './ssh'

export function registerIpcHandlers(): void {
  registerServerIpcHandlers()
  registerSshIpcHandlers()
  registerSftpIpcHandlers()
  registerFsIpcHandlers()
}
