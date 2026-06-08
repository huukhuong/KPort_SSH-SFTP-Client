import type { QuickCommandInput } from '../../../shared/productivity'

function getCommandsApi() {
  if (!window.kport?.commands) {
    return null
  }

  return window.kport.commands
}

export function listQuickCommands() {
  const api = getCommandsApi()
  if (!api) return Promise.resolve([])
  return api.list()
}

export function createQuickCommand(input: QuickCommandInput) {
  return getCommandsApi().create(input)
}

export function deleteQuickCommand(id: string) {
  return getCommandsApi().delete(id)
}
