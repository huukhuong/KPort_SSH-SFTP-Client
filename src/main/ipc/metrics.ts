import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { collectServerMetrics } from '../ssh/metrics'
import { mapSshError } from '../ssh/errors'

export function registerMetricsIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.SSH_GET_METRICS, (_event, serverId: string) =>
    Promise.resolve()
      .then(() => collectServerMetrics(serverId))
      .catch((error) => {
        throw new Error(mapSshError(error))
      }),
  )
}
