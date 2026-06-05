import type { ServerFormInput } from '../../../shared/server'
import type { ConnectionStatus, SshConnectResult, SshTestResult } from '../../../shared/ssh'

function getSshApi() {
  if (!window.kport?.ssh) {
    throw new Error('KPort SSH API is not available')
  }

  return window.kport.ssh
}

export async function connectServer(serverId: string): Promise<SshConnectResult> {
  return getSshApi().connect(serverId)
}

export async function disconnectServer(serverId: string): Promise<void> {
  await getSshApi().disconnect(serverId)
}

export async function testConnection(input: ServerFormInput): Promise<SshTestResult> {
  return getSshApi().test(input)
}

export async function getConnectionStatus(serverId: string): Promise<ConnectionStatus> {
  return getSshApi().getStatus(serverId)
}
