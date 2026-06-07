import { posix } from 'path'

export function joinRemotePath(parentPath: string, name: string): string {
  const trimmed = name.trim()
  if (!trimmed) {
    throw new Error('Name is required')
  }

  if (trimmed.includes('/')) {
    throw new Error('Name cannot contain "/"')
  }

  if (parentPath === '/') {
    return `/${trimmed}`
  }

  const base = parentPath.replace(/\/$/, '') || '/'
  return `${base}/${trimmed}`
}

export function getRemoteParent(path: string): string {
  const normalized = path.replace(/\/$/, '') || '/'
  if (normalized === '/') return '/'

  const parent = posix.dirname(normalized)
  return parent || '/'
}
