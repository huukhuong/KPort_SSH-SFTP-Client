import { ActionIcon, Breadcrumbs, Group, ScrollArea, Text } from '@mantine/core'
import {
  IconChevronRight,
  IconFile,
  IconFileCode,
  IconFileText,
  IconFolder,
  IconFolderOpen,
  IconRefresh,
  IconUpload,
} from '@tabler/icons-react'
import { PanelHeader } from '../layout/PanelHeader'
import classes from '../../styles/layout.module.css'

interface FileExplorerPanelProps {
  title: 'Local' | 'Remote'
  rootPath: string
}

export function FileExplorerPanel({ title, rootPath }: FileExplorerPanelProps) {
  return (
    <div className={classes.explorerPane}>
      <PanelHeader
        title={title}
        accent={title === 'Local' ? 'local' : 'remote'}
        actions={
          <>
            <ActionIcon variant="subtle" size="sm" aria-label="Refresh">
              <IconRefresh size={14} />
            </ActionIcon>
            <ActionIcon variant="subtle" size="sm" aria-label="Upload">
              <IconUpload size={14} />
            </ActionIcon>
          </>
        }
      />

      <Group px="xs" py={6} gap={4} className={classes.explorerPathBar}>
        <Breadcrumbs separator={<IconChevronRight size={12} />} styles={{ breadcrumb: { fontSize: 12 } }}>
          <Text size="xs" c="dimmed">
            {rootPath}
          </Text>
          <Text size="xs">www</Text>
          <Text size="xs">api</Text>
        </Breadcrumbs>
      </Group>

      <ScrollArea flex={1} type="auto" offsetScrollbars>
        {title === 'Local' ? <LocalTree /> : <RemoteTree />}
      </ScrollArea>
    </div>
  )
}

function LocalTree() {
  return (
    <>
      <TreeRow icon={<IconFolder size={16} />} label="projects" />
      <TreeRow icon={<IconFolderOpen size={16} />} label="kport" indent={1} />
      <TreeRow icon={<IconFileCode size={16} />} label="package.json" indent={2} />
      <TreeRow icon={<IconFile size={16} />} label="deploy.zip" indent={1} />
      <TreeRow icon={<IconFileText size={16} />} label=".env.local" indent={1} active />
    </>
  )
}

function RemoteTree() {
  return (
    <>
      <TreeRow icon={<IconFolder size={16} />} label="var" />
      <TreeRow icon={<IconFolderOpen size={16} />} label="www" indent={1} />
      <TreeRow icon={<IconFolderOpen size={16} />} label="api" indent={2} active />
      <TreeRow icon={<IconFileCode size={16} />} label="docker-compose.yml" indent={3} />
      <TreeRow icon={<IconFileText size={16} />} label=".env" indent={3} />
      <TreeRow icon={<IconFileCode size={16} />} label="nginx.conf" indent={1} />
    </>
  )
}

function TreeRow({
  icon,
  label,
  indent = 0,
  active = false,
}: {
  icon: React.ReactNode
  label: string
  indent?: 0 | 1 | 2 | 3
  active?: boolean
}) {
  const indentClass =
    indent === 1
      ? classes.treeIndent1
      : indent === 2
        ? classes.treeIndent2
        : indent === 3
          ? classes.treeIndent3
          : undefined

  return (
    <div
      className={[classes.treeRow, indentClass, active ? classes.treeRowActive : '']
        .filter(Boolean)
        .join(' ')}
    >
      {icon}
      <Text size="sm" span>
        {label}
      </Text>
    </div>
  )
}
