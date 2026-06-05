import type { ServerFormInput, ServerRecord } from '../../../shared/server'
import type { Server } from '../types'

function getKport() {
  if (!window.kport?.servers) {
    throw new Error('KPort API is not available')
  }

  return window.kport.servers
}

export function toServer(record: ServerRecord): Server {
  return {
    id: record.id,
    name: record.name,
    host: record.host,
    port: record.port,
    username: record.username,
    authType: record.authType,
    isFavorite: record.isFavorite,
    status: 'disconnected',
  }
}

export async function listServers(): Promise<Server[]> {
  const records = await getKport().list()
  return records.map(toServer)
}

export async function createServer(input: ServerFormInput): Promise<Server> {
  const record = await getKport().create(input)
  return toServer(record)
}

export async function updateServer(id: string, input: ServerFormInput): Promise<Server> {
  const record = await getKport().update(id, input)
  return toServer(record)
}

export async function deleteServer(id: string): Promise<void> {
  await getKport().delete(id)
}

export async function toggleServerFavorite(id: string): Promise<Server> {
  const record = await getKport().toggleFavorite(id)
  return toServer(record)
}
