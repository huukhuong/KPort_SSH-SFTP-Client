import type { FileTreeNode, PathSegment } from '../types/fileTree'

export function findNode(root: FileTreeNode, path: string): FileTreeNode | null {
  if (root.path === path) return root

  for (const child of root.children ?? []) {
    const found = findNode(child, path)
    if (found) return found
  }

  return null
}

export function listDirectory(root: FileTreeNode, path: string): FileTreeNode[] {
  const node = findNode(root, path)
  if (!node || node.type !== 'directory') return []

  return [...(node.children ?? [])].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

/** Full path segments including root — used when no separate root nav control. */
export function getPathSegments(_anchorPath: string, currentPath: string): PathSegment[] {
  const normalizedCurrent = normalizeExplorerPath(currentPath)

  if (normalizedCurrent === '/') {
    return [{ label: '/', path: '/' }]
  }

  const parts = normalizedCurrent.split('/').filter(Boolean)
  const segments: PathSegment[] = [{ label: '/', path: '/' }]

  let built = ''
  for (const part of parts) {
    built += `/${part}`
    segments.push({ label: part, path: built })
  }

  return segments
}

/** Breadcrumb trail below root — omits `/` because the root button already represents it. */
export function getBreadcrumbSegments(currentPath: string): PathSegment[] {
  const normalizedCurrent = normalizeExplorerPath(currentPath)
  if (normalizedCurrent === '/') return []

  const parts = normalizedCurrent.split('/').filter(Boolean)
  const segments: PathSegment[] = []
  let built = ''

  for (const part of parts) {
    built += `/${part}`
    segments.push({ label: part, path: built })
  }

  return segments
}

export function normalizeExplorerPath(path: string): string {
  if (!path || path === '/') return '/'
  return path.replace(/\/$/, '') || '/'
}

export function getFileName(path: string): string {
  const parts = path.split('/').filter(Boolean)
  return parts[parts.length - 1] ?? path
}

export function isZipFile(path: string): boolean {
  return /\.zip$/i.test(path)
}
