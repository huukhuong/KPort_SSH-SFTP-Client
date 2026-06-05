import { Client, type SFTPWrapper } from 'ssh2'
import type { ServerFormInput } from '../../shared/server'
import type { ConnectionStatus } from '../../shared/ssh'
import { getServerCredentials, type ServerCredentials } from '../db/servers'
import { buildConnectConfigFromCredentials, buildConnectConfigFromForm } from './config'
import { directoryListingCache } from '../sftp/directory-cache'
import { prefetchRemoteTree } from '../sftp/prefetch'
import { mapSshError } from './errors'

interface ManagedConnection {
  serverId: string
  client: Client
  sftp: SFTPWrapper
  homePath: string
  status: ConnectionStatus
  error?: string
}

class ConnectionManager {
  private connections = new Map<string, ManagedConnection>()

  getStatus(serverId: string): ConnectionStatus {
    return this.connections.get(serverId)?.status ?? 'disconnected'
  }

  getSftp(serverId: string): SFTPWrapper {
    const connection = this.connections.get(serverId)
    if (!connection || connection.status !== 'connected') {
      throw new Error('Not connected to server')
    }

    return connection.sftp
  }

  getHomePath(serverId: string): string | null {
    return this.connections.get(serverId)?.homePath ?? null
  }

  getClient(serverId: string): Client {
    const connection = this.connections.get(serverId)
    if (!connection || connection.status !== 'connected') {
      throw new Error('Not connected to server')
    }

    return connection.client
  }

  async exec(serverId: string, command: string): Promise<string> {
    const connection = this.connections.get(serverId)
    if (!connection || connection.status !== 'connected') {
      throw new Error('Not connected to server')
    }

    return this.execOnClient(connection.client, command)
  }

  async connect(serverId: string): Promise<{ homePath: string }> {
    const existing = this.connections.get(serverId)
    if (existing?.status === 'connected') {
      return { homePath: existing.homePath }
    }

    if (existing) {
      await this.disconnect(serverId)
    }

    const credentials = getServerCredentials(serverId)
    const result = await this.openConnection(serverId, credentials)
    void prefetchRemoteTree(serverId, result.homePath).catch((error) => {
      console.warn('[KPort] Remote directory prefetch failed:', error)
    })
    return result
  }

  async disconnect(serverId: string): Promise<void> {
    const connection = this.connections.get(serverId)
    if (!connection) return

    directoryListingCache.clear(serverId)
    connection.status = 'disconnected'
    this.connections.delete(serverId)

    await new Promise<void>((resolve) => {
      connection.client.end()
      connection.client.once('close', () => resolve())
      setTimeout(resolve, 500)
    })
  }

  async test(input: ServerFormInput): Promise<{ ok: boolean; error?: string }> {
    try {
      const config = buildConnectConfigFromForm(input)
      await this.probeConnection(config)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: mapSshError(error) }
    }
  }

  private async openConnection(
    serverId: string,
    credentials: ServerCredentials,
  ): Promise<{ homePath: string }> {
    const config = buildConnectConfigFromCredentials(credentials)
    const client = new Client()

    const pending: ManagedConnection = {
      serverId,
      client,
      sftp: null as unknown as SFTPWrapper,
      homePath: `/home/${credentials.username}`,
      status: 'connecting',
    }

    this.connections.set(serverId, pending)

    try {
      await this.waitForReady(client, config)
      const sftp = await this.waitForSftp(client)
      const homePath = await this.resolveHomePath(client, credentials.username)

      pending.sftp = sftp
      pending.homePath = homePath
      pending.status = 'connected'
      pending.error = undefined

      return { homePath }
    } catch (error) {
      pending.status = 'error'
      pending.error = mapSshError(error)
      this.connections.delete(serverId)
      client.end()
      throw new Error(mapSshError(error))
    }
  }

  private waitForReady(client: Client, config: ReturnType<typeof buildConnectConfigFromForm>): Promise<void> {
    return new Promise((resolve, reject) => {
      client
        .on('ready', () => resolve())
        .on('error', (error) => reject(error))
        .connect(config)
    })
  }

  private waitForSftp(client: Client): Promise<SFTPWrapper> {
    return new Promise((resolve, reject) => {
      client.sftp((error, sftp) => {
        if (error || !sftp) {
          reject(error ?? new Error('Failed to open SFTP session'))
          return
        }

        resolve(sftp)
      })
    })
  }

  private resolveHomePath(client: Client, username: string): Promise<string> {
    return this.execOnClient(client, 'echo $HOME').then(
      (home) => home || `/home/${username}`,
      () => `/home/${username}`,
    )
  }

  private execOnClient(client: Client, command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      client.exec(command, (error, stream) => {
        if (error || !stream) {
          reject(error ?? new Error('Failed to execute remote command'))
          return
        }

        let stdout = ''
        let stderr = ''

        stream.on('data', (chunk: Buffer | string) => {
          stdout += chunk.toString()
        })
        stream.stderr.on('data', (chunk: Buffer | string) => {
          stderr += chunk.toString()
        })
        stream.on('close', (code: number | null) => {
          if (code !== 0) {
            reject(new Error(stderr.trim() || `Remote command exited with code ${code}`))
            return
          }

          resolve(stdout.trim())
        })
      })
    })
  }

  private probeConnection(config: ReturnType<typeof buildConnectConfigFromForm>): Promise<void> {
    const client = new Client()

    return new Promise((resolve, reject) => {
      let settled = false

      const finish = (callback: () => void) => {
        if (settled) return
        settled = true
        callback()
      }

      client
        .on('ready', () => {
          client.end()
          finish(resolve)
        })
        .on('error', (error) => {
          client.end()
          finish(() => reject(error))
        })
        .connect(config)
    })
  }
}

export const connectionManager = new ConnectionManager()
