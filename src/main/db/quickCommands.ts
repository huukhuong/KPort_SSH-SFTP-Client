import { randomUUID } from 'crypto'
import type { QuickCommandInput, QuickCommandRecord } from '../../shared/productivity'
import { getDatabase } from './index'

interface QuickCommandRow {
  id: string
  label: string
  command: string
  group_name: string | null
  sort_order: number
  created_at: string
}

function rowToRecord(row: QuickCommandRow): QuickCommandRecord {
  return {
    id: row.id,
    label: row.label,
    command: row.command,
    group: row.group_name ?? undefined,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  }
}

export function listQuickCommands(): QuickCommandRecord[] {
  const db = getDatabase()
  const rows = db
    .prepare(
      `SELECT id, label, command, group_name, sort_order, created_at
       FROM quick_commands
       ORDER BY sort_order ASC, label COLLATE NOCASE ASC`,
    )
    .all() as QuickCommandRow[]

  return rows.map(rowToRecord)
}

export function createQuickCommand(input: QuickCommandInput): QuickCommandRecord {
  const db = getDatabase()
  const id = randomUUID()
  const createdAt = new Date().toISOString()
  const maxSort = db.prepare('SELECT MAX(sort_order) AS maxSort FROM quick_commands').get() as {
    maxSort: number | null
  }

  db.prepare(
    `INSERT INTO quick_commands (id, label, command, group_name, sort_order, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    input.label.trim(),
    input.command.trim(),
    input.group?.trim() || null,
    (maxSort.maxSort ?? -1) + 1,
    createdAt,
  )

  const row = db
    .prepare(
      `SELECT id, label, command, group_name, sort_order, created_at
       FROM quick_commands WHERE id = ?`,
    )
    .get(id) as QuickCommandRow

  return rowToRecord(row)
}

export function updateQuickCommand(id: string, input: QuickCommandInput): QuickCommandRecord {
  const db = getDatabase()
  const result = db
    .prepare(
      `UPDATE quick_commands
       SET label = ?, command = ?, group_name = ?
       WHERE id = ?`,
    )
    .run(input.label.trim(), input.command.trim(), input.group?.trim() || null, id)

  if (result.changes === 0) {
    throw new Error(`Quick command not found: ${id}`)
  }

  const row = db
    .prepare(
      `SELECT id, label, command, group_name, sort_order, created_at
       FROM quick_commands WHERE id = ?`,
    )
    .get(id) as QuickCommandRow

  return rowToRecord(row)
}

export function deleteQuickCommand(id: string): void {
  const db = getDatabase()
  const result = db.prepare('DELETE FROM quick_commands WHERE id = ?').run(id)

  if (result.changes === 0) {
    throw new Error(`Quick command not found: ${id}`)
  }
}
