import { useCallback, useMemo, useState } from 'react'
import type { ExplorerContextTarget } from '../components/explorer/ExplorerContextMenu'
import { FILESYSTEM_ROOT, LOCAL_HOME_PATH, getRemoteHomePath } from '../mocks/fileTree'
import { useTerminal } from '../providers/TerminalProvider'
import {
  mockLocalFilesystemRoot,
  mockRemoteFilesystemRoot,
  useExplorerStore,
} from '../stores/explorerStore'
import { useEditorStore } from '../stores/editorStore'
import { useServerStore } from '../stores/serverStore'
import type { FileTreeNode } from '../types/fileTree'
import {
  getBreadcrumbSegments,
  isZipFile,
  listDirectory,
  normalizeExplorerPath,
} from '../utils/fileTree'
import { demoAction } from '../utils/demoNotify'

export function useFileExplorer(side: 'local' | 'remote') {
  const isLocal = side === 'local'
  const filesystemRoot = isLocal ? mockLocalFilesystemRoot : mockRemoteFilesystemRoot

  const activeServer = useServerStore((state) =>
    state.servers.find((server) => server.id === state.activeServerId),
  )
  const homePath = isLocal ? LOCAL_HOME_PATH : getRemoteHomePath(activeServer?.username ?? 'deploy')

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

  const entries = useMemo(
    () => listDirectory(filesystemRoot, currentPath),
    [filesystemRoot, currentPath],
  )
  const breadcrumbs = useMemo(() => getBreadcrumbSegments(currentPath), [currentPath])
  const normalizedCurrent = normalizeExplorerPath(currentPath)
  const normalizedHome = normalizeExplorerPath(homePath)
  const atHome = normalizedCurrent === normalizedHome
  const atRoot = normalizedCurrent === FILESYSTEM_ROOT

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

  const refresh = useCallback(() => demoAction('Refresh', currentPath), [currentPath])

  const upload = useCallback(
    () => demoAction('Upload', `Upload to ${currentPath}`),
    [currentPath],
  )

  const navigateRoot = useCallback(() => navigate(FILESYSTEM_ROOT), [navigate])

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
