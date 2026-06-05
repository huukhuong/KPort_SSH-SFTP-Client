import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import type { TerminalCreateInput, TerminalResizeInput } from '../../shared/terminal'
import { mapSshError } from '../ssh/errors'
import { terminalManager } from '../ssh/terminal-manager'

function wrapHandler<T>(handler: () => Promise<T> | T): Promise<T> {
  return Promise.resolve()
    .then(handler)
    .catch((error) => {
      throw new Error(mapSshError(error))
    })
}

export function registerTerminalIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.TERMINAL_CREATE, (_event, input: TerminalCreateInput) =>
    wrapHandler(() => terminalManager.create(input)),
  )

  ipcMain.handle(IPC_CHANNELS.TERMINAL_WRITE, (_event, terminalId: string, data: string) =>
    wrapHandler(() => {
      terminalManager.write(terminalId, data)
    }),
  )

  ipcMain.handle(IPC_CHANNELS.TERMINAL_RESIZE, (_event, input: TerminalResizeInput) =>
    wrapHandler(() => {
      terminalManager.resize(input.terminalId, input.cols, input.rows)
    }),
  )

  ipcMain.handle(IPC_CHANNELS.TERMINAL_DESTROY, (_event, terminalId: string) =>
    wrapHandler(() => {
      terminalManager.destroy(terminalId)
    }),
  )
}
