import type { ServerFormInput } from './server'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface SshConnectResult {
  serverId: string
  homePath: string
}

export interface SshTestResult {
  ok: boolean
  error?: string
}

export type SshTestInput = ServerFormInput
