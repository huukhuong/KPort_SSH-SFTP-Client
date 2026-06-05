export interface TerminalCreateInput {
  terminalId: string
  serverId: string
  cols: number
  rows: number
  initialCwd?: string
}

export interface TerminalCreateResult {
  terminalId: string
}

export interface TerminalResizeInput {
  terminalId: string
  cols: number
  rows: number
}

export interface TerminalDataEvent {
  terminalId: string
  data: string
}

export interface TerminalExitEvent {
  terminalId: string
}
