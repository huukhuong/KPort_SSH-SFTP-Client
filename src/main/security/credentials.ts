import { safeStorage } from 'electron'

const ENCRYPTED_PREFIX = 'enc:v1:'

let encryptionWarningLogged = false

export function isCredentialEncryptionAvailable(): boolean {
  return safeStorage.isEncryptionAvailable()
}

function logEncryptionFallback(): void {
  if (encryptionWarningLogged) return
  encryptionWarningLogged = true
  console.warn(
    '[KPort] OS credential encryption is unavailable. Passwords will remain stored as plaintext until encryption is enabled.',
  )
}

export function encryptCredential(value: string | null): string | null {
  if (!value) return null
  if (!safeStorage.isEncryptionAvailable()) {
    logEncryptionFallback()
    return value
  }

  const encrypted = safeStorage.encryptString(value)
  return `${ENCRYPTED_PREFIX}${encrypted.toString('base64')}`
}

export function decryptCredential(stored: string | null): string | null {
  if (!stored) return null
  if (!stored.startsWith(ENCRYPTED_PREFIX)) {
    return stored
  }

  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Encrypted credentials exist but OS encryption is unavailable')
  }

  const payload = Buffer.from(stored.slice(ENCRYPTED_PREFIX.length), 'base64')
  return safeStorage.decryptString(payload)
}

export function isEncryptedCredential(stored: string | null): boolean {
  return Boolean(stored?.startsWith(ENCRYPTED_PREFIX))
}
