import { Paper, UnstyledButton } from '@mantine/core'
import { useClickOutside } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
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
  onRename: (node: FileTreeNode) => void
  onDelete: (node: FileTreeNode) => void
  onUpload?: (node: FileTreeNode) => void
  onDownload?: (node: FileTreeNode) => void
  onOpenTerminalHere?: (path: string) => void
}

export function ExplorerContextMenu({
  side,
  target,
  onClose,
  onOpen,
  onRename,
  onDelete,
  onUpload,
  onDownload,
  onOpenTerminalHere,
}: ExplorerContextMenuProps) {
  const isLocal = side === 'local'
  const menuRef = useClickOutside<HTMLDivElement>(onClose)

  if (!target) return null

  const { node } = target
  const zipFile = node.type === 'file' && isZipFile(node.path)

  const run = (action?: () => void) => {
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
          onClick={() => run(() => demoAction('Unzip', unzipDetail))}
        />
      ) : (
        <ContextItem label="Open" onClick={() => run(() => onOpen(node))} />
      )}
      <ContextItem label="Rename" onClick={() => run(() => onRename(node))} />
      <ContextItem
        label="Delete"
        danger
        onClick={() => run(() => onDelete(node))}
      />
      {isLocal && node.type === 'file' && onUpload && (
        <>
          <div className={classes.contextMenuDivider} />
          <ContextItem label="Upload" onClick={() => run(() => onUpload(node))} />
        </>
      )}
      {!isLocal && node.type === 'file' && onDownload && (
        <>
          <div className={classes.contextMenuDivider} />
          <ContextItem label="Download" onClick={() => run(() => onDownload(node))} />
        </>
      )}
      <ContextItem
        label="Copy Path"
        onClick={() =>
          run(() => {
            void navigator.clipboard?.writeText(node.path)
            notifications.show({
              title: 'Path copied',
              message: node.path,
              color: 'green',
              autoClose: 2000,
            })
          })
        }
      />
      {node.type === 'directory' && onOpenTerminalHere && (
        <>
          <div className={classes.contextMenuDivider} />
          <ContextItem
            label="Open Terminal Here"
            onClick={() => run(() => onOpenTerminalHere(node.path))}
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
