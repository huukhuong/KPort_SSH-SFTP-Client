export function mapSshError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  const lower = message.toLowerCase()

  if (lower.includes('authentication') || lower.includes('auth fail')) {
    return 'Authentication failed — check username, password, or private key'
  }

  if (lower.includes('timed out') || lower.includes('timeout')) {
    return 'Connection timed out'
  }

  if (lower.includes('econnrefused') || lower.includes('connection refused')) {
    return 'Connection refused — check host and port'
  }

  if (lower.includes('enotfound') || lower.includes('getaddrinfo')) {
    return 'Host not found — check the hostname'
  }

  if (lower.includes('handshake')) {
    return 'SSH handshake failed'
  }

  return message
}
