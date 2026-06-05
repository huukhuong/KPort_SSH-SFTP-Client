import { registerFsIpcHandlers } from './fs'
import { registerMetricsIpcHandlers } from './metrics'
import { registerServerIpcHandlers } from './servers'
import { registerSftpIpcHandlers } from './sftp'
import { registerSshIpcHandlers } from './ssh'

export function registerIpcHandlers(): void {
  registerServerIpcHandlers()
  registerSshIpcHandlers()
  registerMetricsIpcHandlers()
  registerSftpIpcHandlers()
  registerFsIpcHandlers()
}
