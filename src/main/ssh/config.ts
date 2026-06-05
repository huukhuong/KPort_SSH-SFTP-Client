import type { ServerFormInput } from '../../shared/server'
import type { ServerCredentials } from '../db/servers'

const CONNECT_TIMEOUT_MS = 15_000

export interface SshConnectConfig {
  host: string
  port: number
  username: string
  password?: string
  privateKey?: string
  readyTimeout: number
}

export function buildConnectConfigFromCredentials(credentials: ServerCredentials): SshConnectConfig {
  const config: SshConnectConfig = {
    host: credentials.host,
    port: credentials.port,
    username: credentials.username,
    readyTimeout: CONNECT_TIMEOUT_MS,
  }

  if (credentials.authType === 'password') {
    if (!credentials.password) {
      throw new Error('Password is required for this server')
    }
    config.password = credentials.password
  } else {
    if (!credentials.privateKey) {
      throw new Error('Private key is required for this server')
    }
    config.privateKey = credentials.privateKey
  }

  return config
}

export function buildConnectConfigFromForm(input: ServerFormInput): SshConnectConfig {
  const config: SshConnectConfig = {
    host: input.host.trim(),
    port: input.port,
    username: input.username.trim(),
    readyTimeout: CONNECT_TIMEOUT_MS,
  }

  if (input.authType === 'password') {
    if (!input.password?.trim()) {
      throw new Error('Password is required')
    }
    config.password = input.password.trim()
  } else {
    if (!input.privateKey?.trim()) {
      throw new Error('Private key is required')
    }
    config.privateKey = input.privateKey.trim()
  }

  return config
}
