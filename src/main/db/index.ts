import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'

let db: Database.Database | null = null

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS servers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  host TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 22,
  username TEXT NOT NULL,
  auth_type TEXT NOT NULL,
  password_encrypted TEXT,
  private_key_path TEXT,
  is_favorite INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
`

export function getDatabase(): Database.Database {
  if (db) return db

  const dbPath = join(app.getPath('userData'), 'kport.db')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.exec(MIGRATION_SQL)

  return db
}

export function closeDatabase(): void {
  if (!db) return
  db.close()
  db = null
}
