import { randomUUID } from 'crypto'
import type {
  FavoriteDirectoryInput,
  FavoriteDirectoryRecord,
} from '../../shared/productivity'
import { getDatabase } from './index'

interface FavoriteRow {
  id: string
  server_id: string
  path: string
  label: string
  created_at: string
}

function rowToRecord(row: FavoriteRow): FavoriteDirectoryRecord {
  return {
    id: row.id,
    serverId: row.server_id,
    path: row.path,
    label: row.label,
    createdAt: row.created_at,
  }
}

export function listFavoriteDirectories(serverId?: string): FavoriteDirectoryRecord[] {
  const db = getDatabase()
  const rows = serverId
    ? (db
        .prepare(
          `SELECT id, server_id, path, label, created_at
           FROM favorite_directories
           WHERE server_id = ?
           ORDER BY label COLLATE NOCASE ASC`,
        )
        .all(serverId) as FavoriteRow[])
    : (db
        .prepare(
          `SELECT id, server_id, path, label, created_at
           FROM favorite_directories
           ORDER BY label COLLATE NOCASE ASC`,
        )
        .all() as FavoriteRow[])

  return rows.map(rowToRecord)
}

export function addFavoriteDirectory(input: FavoriteDirectoryInput): FavoriteDirectoryRecord {
  const db = getDatabase()
  const id = randomUUID()
  const createdAt = new Date().toISOString()
  const path = input.path.trim()
  const label = input.label?.trim() || path.split('/').filter(Boolean).pop() || path

  db.prepare(
    `INSERT INTO favorite_directories (id, server_id, path, label, created_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(server_id, path) DO UPDATE SET label = excluded.label`,
  ).run(id, input.serverId, path, label, createdAt)

  const row = db
    .prepare(
      `SELECT id, server_id, path, label, created_at
       FROM favorite_directories
       WHERE server_id = ? AND path = ?`,
    )
    .get(input.serverId, path) as FavoriteRow

  return rowToRecord(row)
}

export function removeFavoriteDirectory(id: string): void {
  const db = getDatabase()
  const result = db.prepare('DELETE FROM favorite_directories WHERE id = ?').run(id)

  if (result.changes === 0) {
    throw new Error(`Favorite not found: ${id}`)
  }
}
