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

export function getParentExplorerPath(path: string, rootPath = '/'): string | null {
  const normalized = normalizeExplorerPath(path)
  const normalizedRoot = normalizeExplorerPath(rootPath)

  if (normalized === normalizedRoot) return null

  if (/^[a-zA-Z]:\//.test(normalized)) {
    const drive = normalized.slice(0, 2)
    const parts = normalized.slice(3).split('/').filter(Boolean)
    if (parts.length === 0) return null
    if (parts.length === 1) return `${drive}/`
    return `${drive}/${parts.slice(0, -1).join('/')}`
  }

  if (normalized === '/') return null

  const parts = normalized.split('/').filter(Boolean)
  if (parts.length === 1) return '/'
  return `/${parts.slice(0, -1).join('/')}`
}

function collapsePathSegments(path: string): string {
  const isWindowsAbsolute = /^[a-zA-Z]:\//.test(path)
  const drive = isWindowsAbsolute ? path.slice(0, 2) : ''
  const remainder = isWindowsAbsolute ? path.slice(2) : path
  const parts = remainder.split('/').filter(Boolean)
  const stack: string[] = []

  for (const part of parts) {
    if (part === '.') continue
    if (part === '..') {
      stack.pop()
      continue
    }
    stack.push(part)
  }

  const joined = stack.join('/')
  if (isWindowsAbsolute) {
    return joined ? `${drive}/${joined}` : `${drive}/`
  }

  return joined ? `/${joined}` : '/'
}

function expandTildeInput(input: string, homePath: string): string {
  if (input === '~') return normalizeExplorerPath(homePath)

  if (input.startsWith('~/')) {
    const suffix = input.slice(2)
    const home = normalizeExplorerPath(homePath)
    if (home === '/') return `/${suffix}`
    return `${home}/${suffix}`
  }

  return input
}

export function parsePathInputForCompletion(
  input: string,
  options: { homePath: string; currentPath: string; isLocal: boolean },
): { parentPath: string; partial: string } | null {
  const raw = input.trim()
  if (!raw) return null

  let working = expandTildeInput(raw, options.homePath)

  if (options.isLocal && /^[a-zA-Z]:[\\/]/.test(working)) {
    working = working.replace(/\\/g, '/')
  } else if (!working.startsWith('/') && !/^[a-zA-Z]:\//.test(working)) {
    const base = normalizeExplorerPath(options.currentPath)
    working = base === '/' ? `/${working}` : `${base}/${working}`
  }

  if (working.endsWith('/')) {
    const parent = collapsePathSegments(working.slice(0, -1) || '/')
    return { parentPath: parent, partial: '' }
  }

  const lastSlash = working.lastIndexOf('/')
  if (lastSlash === -1) {
    return {
      parentPath: normalizeExplorerPath(options.currentPath),
      partial: working,
    }
  }

  const parentPart = working.slice(0, lastSlash) || '/'
  const partial = working.slice(lastSlash + 1)

  return {
    parentPath: collapsePathSegments(parentPart),
    partial,
  }
}

export function formatChildDirectoryPath(parentPath: string, name: string): string {
  if (parentPath === '/') return `/${name}/`
  if (/^[a-zA-Z]:\/$/.test(parentPath)) return `${parentPath}${name}/`
  return `${parentPath}/${name}/`
}

export function filterMatchingDirectories(
  entries: FileTreeNode[],
  partial: string,
): FileTreeNode[] {
  const prefix = partial.toLowerCase()

  return entries
    .filter((entry) => entry.type === 'directory')
    .filter((entry) => !prefix || entry.name.toLowerCase().startsWith(prefix))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function buildDirectorySuggestions(
  parentPath: string,
  entries: FileTreeNode[],
  limit = 24,
): string[] {
  return filterMatchingDirectories(entries, '')
    .map((entry) => formatChildDirectoryPath(parentPath, entry.name))
    .slice(0, limit)
}

export function buildTabCompletionTarget(
  parentPath: string,
  partial: string,
  matches: FileTreeNode[],
): string | null {
  if (matches.length === 0) return null

  if (matches.length === 1) {
    return formatChildDirectoryPath(parentPath, matches[0].name)
  }

  const names = matches.map((entry) => entry.name)
  let common = names[0]

  for (const name of names.slice(1)) {
    let index = 0
    while (
      index < common.length &&
      index < name.length &&
      common[index].toLowerCase() === name[index].toLowerCase()
    ) {
      index += 1
    }
    common = common.slice(0, index)
    if (!common) break
  }

  if (common.length > partial.length) {
    if (parentPath === '/') return `/${common}`
    if (/^[a-zA-Z]:\/$/.test(parentPath)) return `${parentPath}${common}`
    return `${parentPath}/${common}`
  }

  return formatChildDirectoryPath(parentPath, matches[0].name)
}

export interface PathSuggestionResult {
  suggestions: string[]
  tabCompletion: string | null
}

export function resolvePathSuggestions(
  parentPath: string,
  entries: FileTreeNode[],
  partial: string,
  limit = 24,
): PathSuggestionResult {
  const matches = filterMatchingDirectories(entries, partial)
  const suggestions = matches
    .map((entry) => formatChildDirectoryPath(parentPath, entry.name))
    .slice(0, limit)

  return {
    suggestions,
    tabCompletion: buildTabCompletionTarget(parentPath, partial, matches),
  }
}

export function resolveExplorerInputPath(
  input: string,
  options: { homePath: string; currentPath: string; isLocal: boolean },
): string | null {
  const raw = input.trim()
  if (!raw) return null

  if (raw === '~') {
    return normalizeExplorerPath(options.homePath)
  }

  if (raw.startsWith('~/')) {
    const suffix = raw.slice(2)
    const home = normalizeExplorerPath(options.homePath)
    if (home === '/') return collapsePathSegments(`/${suffix}`)
    return collapsePathSegments(`${home}/${suffix}`)
  }

  if (options.isLocal && /^[a-zA-Z]:[\\/]/.test(raw)) {
    const normalized = raw.replace(/\\/g, '/')
    return collapsePathSegments(normalized)
  }

  if (raw.startsWith('/')) {
    return collapsePathSegments(raw)
  }

  const base = normalizeExplorerPath(options.currentPath)
  const relative = raw.startsWith('./') ? raw.slice(2) : raw
  const joined = base === '/' ? `/${relative}` : `${base}/${relative}`
  return collapsePathSegments(joined)
}

export function getFileName(path: string): string {
  const parts = path.split('/').filter(Boolean)
  return parts[parts.length - 1] ?? path
}

export function joinExplorerEntryPath(parentPath: string, name: string): string {
  const trimmed = name.trim()
  if (!trimmed) {
    throw new Error('Name is required')
  }

  if (trimmed.includes('/') || trimmed.includes('\\')) {
    throw new Error('Name cannot contain path separators')
  }

  if (/^[a-zA-Z]:\/$/.test(parentPath)) {
    return `${parentPath}${trimmed}`
  }

  if (parentPath === '/') {
    return `/${trimmed}`
  }

  return `${parentPath}/${trimmed}`
}

export function buildRenamedExplorerPath(
  currentPath: string,
  newName: string,
  rootPath: string,
): string {
  const parent = getParentExplorerPath(currentPath, rootPath)
  if (parent === null) {
    if (/^[a-zA-Z]:\\?$/.test(currentPath) || /^[a-zA-Z]:\//.test(currentPath)) {
      const drive = currentPath.slice(0, 2)
      return `${drive}/${newName}`
    }

    return joinExplorerEntryPath('/', newName)
  }

  return joinExplorerEntryPath(parent, newName)
}

export function isZipFile(path: string): boolean {
  return /\.zip$/i.test(path)
}
