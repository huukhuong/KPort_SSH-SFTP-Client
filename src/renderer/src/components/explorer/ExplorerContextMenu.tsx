import { Paper, UnstyledButton } from '@mantine/core'
import { useClickOutside } from '@mantine/hooks'
import type { RefObject } from 'react'
import type { FileTreeNode } from '../../types/fileTree'
import { demoAction } from '../../utils/demoNotify'
import { getFileName, isZipFile } from '../../utils/fileTree'
import classes from '../../styles/layout.module.css'

export interface ExplorerContextTarget {
  node: FileTreeNode
  x: number
  y: number
}

interface ExplorerContextMenuProps {
  side: 'local' | 'remote'
  target: ExplorerContextTarget | null
  onClose: () => void
  onOpen: (node: FileTreeNode) => void
  onOpenTerminalHere?: (path: string) => void
}

export function ExplorerContextMenu({
  side,
  target,
  onClose,
  onOpen,
  onOpenTerminalHere,
}: ExplorerContextMenuProps) {
  const isLocal = side === 'local'
  const menuRef = useClickOutside<HTMLDivElement>(onClose)

  if (!target) return null

  const { node } = target
  const name = getFileName(node.path)
  const zipFile = node.type === 'file' && isZipFile(node.path)

  const run = (label: string, action?: () => void) => {
    action?.()
    onClose()
  }

  const unzipDetail = isLocal
    ? `Extract ${node.path}`
    : `Extract to ${node.path.replace(/\.zip$/i, '')}/`

  return (
    <Paper
      ref={menuRef as RefObject<HTMLDivElement>}
      className={classes.explorerContextMenu}
      shadow="md"
      style={{ position: 'fixed', top: target.y, left: target.x, zIndex: 300 }}
      onContextMenu={(event) => event.preventDefault()}
    >
      {zipFile ? (
        <ContextItem
          label="Unzip"
          onClick={() => run('Unzip', () => demoAction('Unzip', unzipDetail))}
        />
      ) : (
        <ContextItem label="Open" onClick={() => run('Open', () => onOpen(node))} />
      )}
      <ContextItem label="Rename" onClick={() => run('Rename', () => demoAction('Rename', `Rename ${name}`))} />
      <ContextItem
        label="Delete"
        danger
        onClick={() => run('Delete', () => demoAction('Delete', `Delete ${name}`))}
      />
      <div className={classes.contextMenuDivider} />
      <ContextItem
        label="Upload"
        onClick={() =>
          run(
            'Upload',
            () =>
              demoAction(
                'Upload',
                isLocal ? `Upload ${node.path}` : `Upload to ${node.path}`,
              ),
          )
        }
      />
      {!isLocal && (
        <ContextItem
          label="Download"
          onClick={() => run('Download', () => demoAction('Download', `Download ${node.path}`))}
        />
      )}
      <ContextItem
        label="Copy Path"
        onClick={() =>
          run('Copy Path', () => {
            void navigator.clipboard?.writeText(node.path)
            demoAction('Copy Path', node.path)
          })
        }
      />
      {node.type === 'directory' && onOpenTerminalHere && (
        <>
          <div className={classes.contextMenuDivider} />
          <ContextItem
            label="Open Terminal Here"
            onClick={() => run('Open Terminal Here', () => onOpenTerminalHere(node.path))}
          />
        </>
      )}
    </Paper>
  )
}

function ContextItem({
  label,
  onClick,
  danger = false,
}: {
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <UnstyledButton
      className={danger ? classes.contextMenuItemDanger : classes.contextMenuItem}
      onClick={onClick}
    >
      {label}
    </UnstyledButton>
  )
}
