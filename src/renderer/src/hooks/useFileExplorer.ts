import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ExplorerContextTarget } from '../components/explorer/ExplorerContextMenu'
import { useTerminal } from '../providers/TerminalProvider'
import {
  clearDirectoryCache,
  directoryCacheScopes,
  getCachedDirectory,
  invalidateDirectory,
  setCachedDirectory,
} from '../services/directoryListingCache'
import { listLocalDirectory } from '../services/fs'
import { listRemoteDirectory } from '../services/sftp'
import { useExplorerStore } from '../stores/explorerStore'
import { useEditorStore } from '../stores/editorStore'
import { useServerStore } from '../stores/serverStore'
import type { FileTreeNode } from '../types/fileTree'
import { getBreadcrumbSegments, isZipFile, normalizeExplorerPath } from '../utils/fileTree'
import { demoAction } from '../utils/demoNotify'

export function useFileExplorer(side: 'local' | 'remote') {
  const isLocal = side === 'local'

  const activeServer = useServerStore((state) =>
    state.servers.find((server) => server.id === state.activeServerId),
  )
  const localHomePath = useExplorerStore((state) => state.localHomePath)
  const localRootPath = useExplorerStore((state) => state.localRootPath)
  const localPathsReady = useExplorerStore((state) => state.localPathsReady)
  const remoteHomePath = useExplorerStore((state) => state.remoteHomePath)
  const homePath = isLocal ? localHomePath : remoteHomePath
  const rootPath = isLocal ? localRootPath : '/'

  const currentPath = useExplorerStore((state) => (isLocal ? state.localPath : state.remotePath))
  const selectedPath = useExplorerStore((state) =>
    isLocal ? state.selectedLocalPath : state.selectedRemotePath,
  )
  const navigate = useExplorerStore((state) =>
    isLocal ? state.navigateLocal : state.navigateRemote,
  )
  const select = useExplorerStore((state) => (isLocal ? state.selectLocal : state.selectRemote))

  const openFile = useEditorStore((state) => state.openFile)
  const { openTerminalHere } = useTerminal()

  const [contextMenu, setContextMenu] = useState<ExplorerContextTarget | null>(null)
  const [entries, setEntries] = useState<FileTreeNode[]>([])
  const [loading, setLoading] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const isConnected = activeServer?.status === 'connected'
  const isConnecting = activeServer?.status === 'connecting'
  const serverId = activeServer?.id
  const cacheScope = isLocal
    ? directoryCacheScopes.local
    : serverId
      ? directoryCacheScopes.remote(serverId)
      : null

  useEffect(() => {
    if (isLocal) {
      if (!localPathsReady || !cacheScope) {
        setEntries([])
        setListError(null)
        setLoading(true)
        return
      }

      const cached = getCachedDirectory(cacheScope, currentPath)
      if (cached) {
        setEntries(cached)
        setListError(null)
        setLoading(false)
        return
      }

      let cancelled = false
      setLoading(true)
      setListError(null)

      void listLocalDirectory(currentPath)
        .then((items) => {
          if (cancelled) return
          setCachedDirectory(cacheScope, currentPath, items)
          setEntries(items)
          setLoading(false)
        })
        .catch((error) => {
          if (cancelled) return
          setEntries([])
          setListError(error instanceof Error ? error.message : 'Failed to list directory')
          setLoading(false)
        })

      return () => {
        cancelled = true
      }
    }

    if (!serverId || !cacheScope) {
      setEntries([])
      setListError('Select a server from the sidebar')
      setLoading(false)
      return
    }

    if (isConnecting) {
      setEntries([])
      setListError(null)
      setLoading(true)
      return
    }

    if (!isConnected) {
      clearDirectoryCache(cacheScope)
      setEntries([])
      setListError(
        activeServer?.status === 'error'
          ? 'Connection failed — double-click the server to retry'
          : 'Double-click the server to connect',
      )
      setLoading(false)
      return
    }

    const cached = getCachedDirectory(cacheScope, currentPath)
    if (cached) {
      setEntries(cached)
      setListError(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setListError(null)

    void listRemoteDirectory(serverId, currentPath)
      .then((items) => {
        if (cancelled) return
        setCachedDirectory(cacheScope, currentPath, items)
        setEntries(items)
        setLoading(false)
      })
      .catch((error) => {
        if (cancelled) return
        setEntries([])
        setListError(error instanceof Error ? error.message : 'Failed to list directory')
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [
    isLocal,
    localPathsReady,
    cacheScope,
    serverId,
    isConnected,
    isConnecting,
    currentPath,
    refreshKey,
    activeServer?.status,
  ])

  const breadcrumbs = useMemo(() => getBreadcrumbSegments(currentPath), [currentPath])
  const normalizedCurrent = normalizeExplorerPath(currentPath)
  const normalizedHome = normalizeExplorerPath(homePath)
  const normalizedRoot = normalizeExplorerPath(rootPath)
  const atHome = normalizedCurrent === normalizedHome
  const atRoot = normalizedCurrent === normalizedRoot

  const openNode = useCallback(
    (node: FileTreeNode) => {
      if (node.type === 'directory') {
        navigate(node.path)
        return
      }

      if (isZipFile(node.path)) {
        const detail = isLocal
          ? `Extract ${node.path}`
          : `Extract to ${node.path.replace(/\.zip$/i, '')}/`
        demoAction('Unzip', detail)
        return
      }

      openFile(node.path)
    },
    [isLocal, navigate, openFile],
  )

  const openContextMenu = useCallback(
    (node: FileTreeNode, event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      select(node.path)
      setContextMenu({ node, x: event.clientX, y: event.clientY })
    },
    [select],
  )

  const closeContextMenu = useCallback(() => setContextMenu(null), [])

  const refresh = useCallback(() => {
    if (cacheScope) {
      invalidateDirectory(cacheScope, currentPath)
    }
    setRefreshKey((key) => key + 1)
  }, [cacheScope, currentPath])

  const upload = useCallback(
    () => demoAction('Upload', `Upload to ${currentPath}`),
    [currentPath],
  )

  const navigateRoot = useCallback(() => navigate(rootPath), [navigate, rootPath])

  const navigateHome = useCallback(() => navigate(homePath), [navigate, homePath])

  return {
    isLocal,
    title: isLocal ? ('Local' as const) : ('Remote' as const),
    accent: isLocal ? ('local' as const) : ('remote' as const),
    currentPath,
    homePath,
    atHome,
    atRoot,
    breadcrumbs,
    entries,
    loading,
    listError,
    selectedPath,
    contextMenu,
    showOpenTerminalHere: !isLocal,
    actions: {
      navigate,
      select,
      openNode,
      openContextMenu,
      closeContextMenu,
      refresh,
      upload,
      navigateRoot,
      navigateHome,
      openTerminalHere: isLocal ? undefined : openTerminalHere,
    },
  }
}
