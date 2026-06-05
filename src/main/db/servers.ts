import { randomUUID } from 'crypto'
import type { ServerFormInput, ServerRecord } from '../../shared/server'
import { getDatabase } from './index'

interface ServerRow {
  id: string
  name: string
  host: string
  port: number
  username: string
  auth_type: string
  password_encrypted: string | null
  private_key_path: string | null
  is_favorite: number
  created_at: string
}

function rowToRecord(row: ServerRow): ServerRecord {
  return {
    id: row.id,
    name: row.name,
    host: row.host,
    port: row.port,
    username: row.username,
    authType: row.auth_type as ServerRecord['authType'],
    isFavorite: row.is_favorite === 1,
    createdAt: row.created_at,
  }
}

function resolveCredentials(
  input: ServerFormInput,
  existing?: { password: string | null; privateKey: string | null },
): { password: string | null; privateKey: string | null } {
  const password =
    input.authType === 'password'
      ? input.password?.trim() || existing?.password || null
      : null

  const privateKey =
    input.authType === 'private_key'
      ? input.privateKey?.trim() || existing?.privateKey || null
      : null

  return { password, privateKey }
}

export function listServers(): ServerRecord[] {
  const db = getDatabase()
  const rows = db
    .prepare(
      `SELECT id, name, host, port, username, auth_type, password_encrypted, private_key_path, is_favorite, created_at
       FROM servers
       ORDER BY is_favorite DESC, name COLLATE NOCASE ASC`,
    )
    .all() as ServerRow[]

  return rows.map(rowToRecord)
}

export function createServer(input: ServerFormInput): ServerRecord {
  const db = getDatabase()
  const id = randomUUID()
  const createdAt = new Date().toISOString()
  const { password, privateKey } = resolveCredentials(input)

  db.prepare(
    `INSERT INTO servers (
      id, name, host, port, username, auth_type, password_encrypted, private_key_path, is_favorite, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
  ).run(
    id,
    input.name.trim(),
    input.host.trim(),
    input.port,
    input.username.trim(),
    input.authType,
    password,
    privateKey,
    createdAt,
  )

  return {
    id,
    name: input.name.trim(),
    host: input.host.trim(),
    port: input.port,
    username: input.username.trim(),
    authType: input.authType,
    isFavorite: false,
    createdAt,
  }
}

export function updateServer(id: string, input: ServerFormInput): ServerRecord {
  const db = getDatabase()
  const existing = db
    .prepare('SELECT password_encrypted, private_key_path FROM servers WHERE id = ?')
    .get(id) as { password_encrypted: string | null; private_key_path: string | null } | undefined

  if (!existing) {
    throw new Error(`Server not found: ${id}`)
  }

  const { password, privateKey } = resolveCredentials(input, {
    password: existing.password_encrypted,
    privateKey: existing.private_key_path,
  })

  db.prepare(
    `UPDATE servers
     SET name = ?, host = ?, port = ?, username = ?, auth_type = ?, password_encrypted = ?, private_key_path = ?
     WHERE id = ?`,
  ).run(
    input.name.trim(),
    input.host.trim(),
    input.port,
    input.username.trim(),
    input.authType,
    password,
    privateKey,
    id,
  )

  const row = db
    .prepare(
      `SELECT id, name, host, port, username, auth_type, password_encrypted, private_key_path, is_favorite, created_at
       FROM servers WHERE id = ?`,
    )
    .get(id) as ServerRow

  return rowToRecord(row)
}

export function deleteServer(id: string): void {
  const db = getDatabase()
  const result = db.prepare('DELETE FROM servers WHERE id = ?').run(id)

  if (result.changes === 0) {
    throw new Error(`Server not found: ${id}`)
  }
}

export interface ServerCredentials {
  id: string
  host: string
  port: number
  username: string
  authType: ServerRecord['authType']
  password: string | null
  privateKey: string | null
}

export function getServerCredentials(id: string): ServerCredentials {
  const db = getDatabase()
  const row = db
    .prepare(
      `SELECT id, host, port, username, auth_type, password_encrypted, private_key_path
       FROM servers WHERE id = ?`,
    )
    .get(id) as
    | {
        id: string
        host: string
        port: number
        username: string
        auth_type: string
        password_encrypted: string | null
        private_key_path: string | null
      }
    | undefined

  if (!row) {
    throw new Error(`Server not found: ${id}`)
  }

  return {
    id: row.id,
    host: row.host,
    port: row.port,
    username: row.username,
    authType: row.auth_type as ServerCredentials['authType'],
    password: row.password_encrypted,
    privateKey: row.private_key_path,
  }
}

export function toggleServerFavorite(id: string): ServerRecord {
  const db = getDatabase()
  const result = db
    .prepare('UPDATE servers SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END WHERE id = ?')
    .run(id)

  if (result.changes === 0) {
    throw new Error(`Server not found: ${id}`)
  }

  const row = db
    .prepare(
      `SELECT id, name, host, port, username, auth_type, password_encrypted, private_key_path, is_favorite, created_at
       FROM servers WHERE id = ?`,
    )
    .get(id) as ServerRow

  return rowToRecord(row)
}
