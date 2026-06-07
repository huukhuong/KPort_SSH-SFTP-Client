import { registerDialogIpcHandlers } from './dialog'
import { registerFsIpcHandlers } from './fs'
import { registerMetricsIpcHandlers } from './metrics'
import { registerServerIpcHandlers } from './servers'
import { registerSftpIpcHandlers } from './sftp'
import { registerSshIpcHandlers } from './ssh'
import { registerTerminalIpcHandlers } from './terminal'
import { registerTransferIpcHandlers } from './transfer'

export function registerIpcHandlers(): void {
  registerServerIpcHandlers()
  registerSshIpcHandlers()
  registerTerminalIpcHandlers()
  registerMetricsIpcHandlers()
  registerSftpIpcHandlers()
  registerFsIpcHandlers()
  registerTransferIpcHandlers()
  registerDialogIpcHandlers()
}
