import { FileIcon, FolderIcon } from 'react-material-icon-theme'
import type { FileTreeNode } from '../../types/fileTree'
import { FILESYSTEM_ROOT } from '../../mocks/fileTree'
import classes from '../../styles/layout.module.css'

const ICON_SIZE = 18

interface ExplorerEntryIconProps {
  node: FileTreeNode
  active?: boolean
}

export function ExplorerEntryIcon({ node, active = false }: ExplorerEntryIconProps) {
  if (node.type === 'directory') {
    return (
      <span className={classes.treeRowIcon} aria-hidden>
        <FolderIcon
          folderName={node.name}
          isRoot={node.path === FILESYSTEM_ROOT}
          isOpen={active}
          theme="specific"
          size={ICON_SIZE}
        />
      </span>
    )
  }

  return (
    <span className={classes.treeRowIcon} aria-hidden>
      <FileIcon fileName={node.name} size={ICON_SIZE} />
    </span>
  )
}
