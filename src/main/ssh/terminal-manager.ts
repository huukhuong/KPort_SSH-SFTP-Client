import { BrowserWindow } from 'electron'
import type { ClientChannel } from 'ssh2'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import type { TerminalCreateInput, TerminalCreateResult } from '../../shared/terminal'
import { connectionManager } from './connection-manager'

interface ManagedTerminal {
  id: string
  serverId: string
  stream: ClientChannel
}

function shellEscapePath(path: string): string {
  return `'${path.replace(/'/g, `'\\''`)}'`
}

class TerminalManager {
  private terminals = new Map<string, ManagedTerminal>()

  async create(input: TerminalCreateInput): Promise<TerminalCreateResult> {
    const client = connectionManager.getClient(input.serverId)
    const terminalId = input.terminalId
    const cols = Math.max(2, input.cols || 80)
    const rows = Math.max(2, input.rows || 24)

    const stream = await new Promise<ClientChannel>((resolve, reject) => {
      client.shell(
        {
          term: 'xterm-256color',
          cols,
          rows,
        },
        (error, channel) => {
          if (error || !channel) {
            reject(error ?? new Error('Failed to open SSH shell'))
            return
          }

          resolve(channel)
        },
      )
    })

    this.terminals.set(terminalId, {
      id: terminalId,
      serverId: input.serverId,
      stream,
    })

    stream.on('data', (chunk: Buffer | string) => {
      this.emitData(terminalId, chunk.toString())
    })

    stream.stderr.on('data', (chunk: Buffer | string) => {
      this.emitData(terminalId, chunk.toString())
    })

    stream.on('close', () => {
      this.terminals.delete(terminalId)
      this.emitExit(terminalId)
    })

    if (input.initialCwd) {
      stream.write(`cd ${shellEscapePath(input.initialCwd)}\n`)
    }

    return { terminalId }
  }

  write(terminalId: string, data: string): void {
    const terminal = this.terminals.get(terminalId)
    if (!terminal) {
      throw new Error('Terminal session not found')
    }

    terminal.stream.write(data)
  }

  resize(terminalId: string, cols: number, rows: number): void {
    const terminal = this.terminals.get(terminalId)
    if (!terminal) return

    const safeCols = Math.max(2, cols)
    const safeRows = Math.max(2, rows)
    terminal.stream.setWindow(safeRows, safeCols, 0, 0)
  }

  destroy(terminalId: string): void {
    const terminal = this.terminals.get(terminalId)
    if (!terminal) return

    terminal.stream.close()
    this.terminals.delete(terminalId)
  }

  destroyAllForServer(serverId: string): void {
    for (const [terminalId, terminal] of this.terminals) {
      if (terminal.serverId === serverId) {
        this.destroy(terminalId)
      }
    }
  }

  private emitData(terminalId: string, data: string): void {
    const payload = { terminalId, data }

    for (const window of BrowserWindow.getAllWindows()) {
      if (!window.isDestroyed()) {
        window.webContents.send(IPC_CHANNELS.TERMINAL_DATA, payload)
      }
    }
  }

  private emitExit(terminalId: string): void {
    const payload = { terminalId }

    for (const window of BrowserWindow.getAllWindows()) {
      if (!window.isDestroyed()) {
        window.webContents.send(IPC_CHANNELS.TERMINAL_EXIT, payload)
      }
    }
  }
}

export const terminalManager = new TerminalManager()
