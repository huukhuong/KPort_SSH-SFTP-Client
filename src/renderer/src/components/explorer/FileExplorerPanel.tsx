import {
  ActionIcon,
  Autocomplete,
  Center,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Text,
} from '@mantine/core'
import { IconPlugConnected } from '@tabler/icons-react'
import { IconArrowLeft, IconHome, IconRefresh, IconUpload } from '@tabler/icons-react'
import { useExplorerPathBar } from '../../hooks/useExplorerPathBar'
import { useFileExplorer } from '../../hooks/useFileExplorer'
import type { FileTreeNode } from '../../types/fileTree'
import { PanelHeader } from '../layout/PanelHeader'
import { ExplorerContextMenu } from './ExplorerContextMenu'
import { ExplorerEntryIcon } from './ExplorerEntryIcon'
import classes from '../../styles/layout.module.css'

interface FileExplorerPanelProps {
  side: 'local' | 'remote'
}

export function FileExplorerPanel({ side }: FileExplorerPanelProps) {
  const {
    title,
    accent,
    currentPath,
    homePath,
    serverId,
    atHome,
    atRoot,
    canGoUp,
    parentPath,
    entries,
    loading,
    listError,
    selectedPath,
    contextMenu,
    actions,
  } = useFileExplorer(side)

  const pathBarDisabled = side === 'remote' && Boolean(listError)
  const { pathInputProps, loadingSuggestions } = useExplorerPathBar({
    currentPath,
    homePath,
    isLocal: side === 'local',
    serverId,
    disabled: pathBarDisabled,
    onNavigate: actions.navigate,
  })

  return (
    <div className={classes.explorerPanelBody}>
      <PanelHeader
        title={title}
        accent={accent}
        actions={
          <>
            <ActionIcon variant="subtle" size="sm" aria-label="Refresh" onClick={actions.refresh}>
              <IconRefresh size={14} />
            </ActionIcon>
            <ActionIcon variant="subtle" size="sm" aria-label="Upload" onClick={actions.upload}>
              <IconUpload size={14} />
            </ActionIcon>
          </>
        }
      />

      <Group px="xs" py={6} gap={4} wrap="nowrap" className={classes.explorerPathBar}>
        <ActionIcon
          variant="subtle"
          size="sm"
          aria-label={parentPath ? `Up to ${parentPath}` : 'Up'}
          title={parentPath ? `cd .. → ${parentPath}` : 'Already at root'}
          disabled={!canGoUp || pathBarDisabled}
          onClick={actions.navigateUp}
          className={classes.explorerNavButton}
        >
          <IconArrowLeft size={14} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          size="sm"
          aria-label="Go to filesystem root (/)"
          title="Root: /"
          disabled={atRoot}
          onClick={actions.navigateRoot}
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
          onClick={actions.navigateHome}
          className={classes.explorerNavButton}
        >
          <IconHome size={14} />
        </ActionIcon>
        <Autocomplete
          className={classes.explorerPathInput}
          size="xs"
          aria-label={`${title} path`}
          placeholder="Type a path, pick a suggestion"
          limit={24}
          rightSection={loadingSuggestions ? <Loader size={14} /> : null}
          renderOption={({ option }) => (
            <Text size="xs" className={classes.explorerPathOption}>
              {option.value}
            </Text>
          )}
          {...pathInputProps}
        />
      </Group>

      <ScrollArea flex={1} type="auto" offsetScrollbars>
        {loading && (
          <Center py="lg">
            <Loader size="sm" />
          </Center>
        )}
        {!loading && listError && (
          <Center py="xl" px="md" style={{ minHeight: 120 }}>
            <Stack gap="xs" align="center" maw={280}>
              {side === 'remote' && (
                <IconPlugConnected size={28} color="var(--mantine-color-gray-6)" stroke={1.5} />
              )}
              <Text size="sm" c="dimmed" ta="center">
                {listError}
              </Text>
            </Stack>
          </Center>
        )}
        {!loading &&
          !listError &&
          entries.length === 0 && (
            <Text px="sm" py="md" size="sm" c="dimmed">
              Empty directory
            </Text>
          )}
        {!loading &&
          entries.map((entry) => (
          <TreeRow
            key={entry.path}
            node={entry}
            active={selectedPath === entry.path}
            onSelect={() => actions.select(entry.path)}
            onOpen={() => actions.openNode(entry)}
            onContextMenu={(event) => actions.openContextMenu(entry, event)}
          />
          ))}
      </ScrollArea>

      <ExplorerContextMenu
        side={side}
        target={contextMenu}
        onClose={actions.closeContextMenu}
        onOpen={actions.openNode}
        onOpenTerminalHere={actions.openTerminalHere}
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
  return (
    <div
      className={[classes.treeRow, active ? classes.treeRowActive : ''].filter(Boolean).join(' ')}
      onClick={onSelect}
      onDoubleClick={onOpen}
      onContextMenu={onContextMenu}
    >
      <ExplorerEntryIcon node={node} active={active} />
      <Text size="sm" span>
        {node.name}
      </Text>
    </div>
  )
}
