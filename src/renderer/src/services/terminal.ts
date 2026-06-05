import type {
  TerminalCreateInput,
  TerminalCreateResult,
  TerminalDataEvent,
  TerminalExitEvent,
  TerminalResizeInput,
} from '../../../shared/terminal'

function getTerminalApi() {
  if (!window.kport?.terminal) {
    throw new Error('KPort Terminal API is not available')
  }

  return window.kport.terminal
}

export function createTerminal(input: TerminalCreateInput): Promise<TerminalCreateResult> {
  return getTerminalApi().create(input)
}

export function writeTerminal(terminalId: string, data: string): Promise<void> {
  return getTerminalApi().write(terminalId, data)
}

export function resizeTerminal(input: TerminalResizeInput): Promise<void> {
  return getTerminalApi().resize(input)
}

export function destroyTerminal(terminalId: string): Promise<void> {
  return getTerminalApi().destroy(terminalId)
}

export function onTerminalData(callback: (event: TerminalDataEvent) => void): () => void {
  return getTerminalApi().onData(callback)
}

export function onTerminalExit(callback: (event: TerminalExitEvent) => void): () => void {
  return getTerminalApi().onExit(callback)
}
