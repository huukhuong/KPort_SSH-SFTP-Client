import type { EditorFileSide } from '../../../shared/editor'
import type { EditorTab } from '../types'

function getFsApi() {
  if (!window.kport?.fs) {
    throw new Error('KPort FS API is not available')
  }

  return window.kport.fs
}

function getSftpApi() {
  if (!window.kport?.sftp) {
    throw new Error('KPort SFTP API is not available')
  }

  return window.kport.sftp
}

export interface OpenEditorFileInput {
  path: string
  side: EditorFileSide
  serverId?: string | null
}

export async function readEditorFile(input: OpenEditorFileInput): Promise<string> {
  if (input.side === 'local') {
    return getFsApi().readFile(input.path)
  }

  if (!input.serverId) {
    throw new Error('No server selected for remote file')
  }

  return getSftpApi().readFile(input.serverId, input.path)
}

export async function writeEditorFile(tab: EditorTab): Promise<void> {
  if (tab.side === 'local') {
    await getFsApi().writeFile(tab.path, tab.content)
    return
  }

  if (!tab.serverId) {
    throw new Error('No server selected for remote file')
  }

  await getSftpApi().writeFile(tab.serverId, tab.path, tab.content)
}
