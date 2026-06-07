import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { migratePlaintextCredentials } from './credential-migration'

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

CREATE TABLE IF NOT EXISTS favorite_directories (
  id TEXT PRIMARY KEY,
  server_id TEXT NOT NULL,
  path TEXT NOT NULL,
  label TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(server_id, path)
);

CREATE TABLE IF NOT EXISTS quick_commands (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  command TEXT NOT NULL,
  group_name TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
`

export function getDatabase(): Database.Database {
  if (db) return db

  const dbPath = join(app.getPath('userData'), 'kport.db')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.exec(MIGRATION_SQL)
  seedDefaultQuickCommands(db)
  migratePlaintextCredentials()

  return db
}

function seedDefaultQuickCommands(database: Database.Database): void {
  const count = database.prepare('SELECT COUNT(*) AS total FROM quick_commands').get() as {
    total: number
  }

  if (count.total > 0) return

  const insert = database.prepare(
    `INSERT INTO quick_commands (id, label, command, group_name, sort_order, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )

  const createdAt = new Date().toISOString()
  const defaults = [
    ['docker-ps', 'docker ps', 'docker ps', 'Docker', 0],
    ['docker-logs', 'docker logs -f api', 'docker logs -f api', 'Docker', 1],
    ['pm2-status', 'pm2 status', 'pm2 status', 'PM2', 2],
    ['nginx-test', 'nginx -t', 'nginx -t', 'Nginx', 3],
  ] as const

  for (const [id, label, command, group, sortOrder] of defaults) {
    insert.run(id, label, command, group, sortOrder, createdAt)
  }
}

export function closeDatabase(): void {
  if (!db) return
  db.close()
  db = null
}
