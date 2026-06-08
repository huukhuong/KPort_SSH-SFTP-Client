import type Database from 'better-sqlite3'
import {
  decryptCredential,
  encryptCredential,
  isEncryptedCredential,
  isCredentialEncryptionAvailable,
} from '../security/credentials'

export function migratePlaintextCredentials(database: Database.Database): void {
  if (!isCredentialEncryptionAvailable()) return

  const rows = database
    .prepare('SELECT id, password_encrypted, private_key_path FROM servers')
    .all() as Array<{
    id: string
    password_encrypted: string | null
    private_key_path: string | null
  }>

  const update = database.prepare(
    'UPDATE servers SET password_encrypted = ?, private_key_path = ? WHERE id = ?',
  )

  for (const row of rows) {
    const password = row.password_encrypted
    const privateKey = row.private_key_path

    const needsPasswordMigration = password && !isEncryptedCredential(password)
    const needsKeyMigration = privateKey && !isEncryptedCredential(privateKey)

    if (!needsPasswordMigration && !needsKeyMigration) continue

    const nextPassword = needsPasswordMigration
      ? encryptCredential(decryptCredential(password))
      : password
    const nextPrivateKey = needsKeyMigration
      ? encryptCredential(decryptCredential(privateKey))
      : privateKey

    update.run(nextPassword, nextPrivateKey, row.id)
  }
}
