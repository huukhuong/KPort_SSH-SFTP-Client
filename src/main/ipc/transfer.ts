import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import type { TransferDirection, TransferJobInput } from '../../shared/transfer'
import { transferManager } from '../transfer/transfer-manager'

export function registerTransferIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.TRANSFER_UPLOAD, (_event, input: TransferJobInput) => {
    transferManager.upload(input)
    return { accepted: true }
  })

  ipcMain.handle(IPC_CHANNELS.TRANSFER_DOWNLOAD, (_event, input: TransferJobInput) => {
    transferManager.download(input)
    return { accepted: true }
  })

  ipcMain.handle(IPC_CHANNELS.TRANSFER_CANCEL, (_event, id: string) => {
    transferManager.cancel(id)
    return { accepted: true }
  })

  ipcMain.handle(
    IPC_CHANNELS.TRANSFER_RETRY,
    (_event, input: TransferJobInput, direction: TransferDirection) => {
      transferManager.retry(input, direction)
      return { accepted: true }
    },
  )
}
