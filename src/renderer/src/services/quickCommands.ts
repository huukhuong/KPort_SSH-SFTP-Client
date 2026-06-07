import type { QuickCommandInput } from '../../../shared/productivity'

function getCommandsApi() {
  if (!window.kport?.commands) {
    throw new Error('KPort commands API is not available')
  }

  return window.kport.commands
}

export function listQuickCommands() {
  return getCommandsApi().list()
}

export function createQuickCommand(input: QuickCommandInput) {
  return getCommandsApi().create(input)
}

export function deleteQuickCommand(id: string) {
  return getCommandsApi().delete(id)
}
