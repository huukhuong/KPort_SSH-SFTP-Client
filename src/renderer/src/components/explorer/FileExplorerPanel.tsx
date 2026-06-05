import { ActionIcon, Anchor, Breadcrumbs, Group, ScrollArea, Text } from '@mantine/core'
import {
  IconChevronRight,
  IconFile,
  IconFileCode,
  IconFileText,
  IconFolder,
  IconFolderOpen,
  IconHome,
  IconRefresh,
  IconUpload,
} from '@tabler/icons-react'
import { useState } from 'react'
import { useEditorStore } from '../../stores/editorStore'
import { getRemoteHomePath } from '../../mocks/fileTree'
import { useServerStore } from '../../stores/serverStore'
import {
  FILESYSTEM_ROOT,
  LOCAL_HOME_PATH,
  mockLocalFilesystemRoot,
  mockRemoteFilesystemRoot,
  useExplorerStore,
} from '../../stores/explorerStore'
import type { FileTreeNode } from '../../types/fileTree'
import {
  getBreadcrumbSegments,
  isZipFile,
  listDirectory,
  normalizeExplorerPath,
} from '../../utils/fileTree'
import { demoAction } from '../../utils/demoNotify'
import { useTerminal } from '../../providers/TerminalProvider'
import { PanelHeader } from '../layout/PanelHeader'
import { ExplorerContextMenu, type ExplorerContextTarget } from './ExplorerContextMenu'
import classes from '../../styles/layout.module.css'

interface FileExplorerPanelProps {
  side: 'local' | 'remote'
}

export function FileExplorerPanel({ side }: FileExplorerPanelProps) {
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

  const entries = listDirectory(filesystemRoot, currentPath)
  const breadcrumbs = getBreadcrumbSegments(currentPath)
  const normalizedCurrent = normalizeExplorerPath(currentPath)
  const normalizedHome = normalizeExplorerPath(homePath)
  const atHome = normalizedCurrent === normalizedHome
  const atRoot = normalizedCurrent === FILESYSTEM_ROOT

  const openNode = (node: FileTreeNode) => {
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
  }

  return (
    <div className={classes.explorerPanelBody}>
      <PanelHeader
        title={isLocal ? 'Local' : 'Remote'}
        accent={isLocal ? 'local' : 'remote'}
        actions={
          <>
            <ActionIcon
              variant="subtle"
              size="sm"
              aria-label="Refresh"
              onClick={() => demoAction('Refresh', currentPath)}
            >
              <IconRefresh size={14} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              size="sm"
              aria-label="Upload"
              onClick={() => demoAction('Upload', `Upload to ${currentPath}`)}
            >
              <IconUpload size={14} />
            </ActionIcon>
          </>
        }
      />

      <Group px="xs" py={6} gap={4} wrap="nowrap" className={classes.explorerPathBar}>
        <ActionIcon
          variant="subtle"
          size="sm"
          aria-label="Go to filesystem root (/)"
          title="Root: /"
          disabled={atRoot}
          onClick={() => navigate(FILESYSTEM_ROOT)}
          className={classes.explorerNavButton}
        >
          <Text size="xs" fw={700} lh={1}>
            /
          </Text>
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          size="sm"
          aria-label={`Go to home (${homePath})`}
          title={`Home: ${homePath}`}
          disabled={atHome}
          onClick={() => navigate(homePath)}
          className={classes.explorerNavButton}
        >
          <IconHome size={14} />
        </ActionIcon>
        {breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator={<IconChevronRight size={12} />}
            styles={{ breadcrumb: { fontSize: 12 } }}
            className={classes.explorerBreadcrumbs}
          >
            {breadcrumbs.map((segment) => (
              <Anchor
                key={segment.path}
                size="xs"
                c="dimmed"
                underline="never"
                onClick={() => navigate(segment.path)}
              >
                {segment.label}
              </Anchor>
            ))}
          </Breadcrumbs>
        )}
      </Group>

      <ScrollArea flex={1} type="auto" offsetScrollbars>
        {entries.map((entry) => (
          <TreeRow
            key={entry.path}
            node={entry}
            active={selectedPath === entry.path}
            onSelect={() => select(entry.path)}
            onOpen={() => openNode(entry)}
            onContextMenu={(event) => {
              event.preventDefault()
              select(entry.path)
              setContextMenu({ node: entry, x: event.clientX, y: event.clientY })
            }}
          />
        ))}
      </ScrollArea>

      <ExplorerContextMenu
        side={side}
        target={contextMenu}
        onClose={() => setContextMenu(null)}
        onOpen={openNode}
        onOpenTerminalHere={!isLocal ? openTerminalHere : undefined}
      />
    </div>
  )
}

function TreeRow({
  node,
  active,
  onSelect,
  onOpen,
  onContextMenu,
}: {
  node: FileTreeNode
  active: boolean
  onSelect: () => void
  onOpen: () => void
  onContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void
}) {
  const icon =
    node.type === 'directory'
      ? active
        ? <IconFolderOpen size={16} />
        : <IconFolder size={16} />
      : node.name.endsWith('.json') || node.name.endsWith('.yml')
        ? <IconFileCode size={16} />
        : node.name.endsWith('.log')
          ? <IconFileText size={16} />
          : <IconFile size={16} />

  return (
    <div
      className={[classes.treeRow, active ? classes.treeRowActive : ''].filter(Boolean).join(' ')}
      onClick={onSelect}
      onDoubleClick={onOpen}
      onContextMenu={onContextMenu}
    >
      {icon}
      <Text size="sm" span>
        {node.name}
      </Text>
    </div>
  )
}
