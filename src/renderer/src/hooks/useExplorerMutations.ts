import { notifications } from '@mantine/notifications'
import { useCallback, useState } from 'react'
import {
  createLocalFile,
  deleteLocalEntry,
  mkdirLocalDirectory,
  renameLocalEntry,
} from '../services/fs'
import {
  createRemoteFile,
  deleteRemoteEntry,
  mkdirRemoteDirectory,
  renameRemoteEntry,
} from '../services/sftp'
import type { FileTreeNode } from '../types/fileTree'
import { buildRenamedExplorerPath } from '../utils/fileTree'
import { useEditorActions } from './useEditorActions'

type NameModalMode = 'mkdir' | 'touch' | 'rename'

interface NameModalState {
  mode: NameModalMode
  initialName: string
  targetNode?: FileTreeNode
}

interface UseExplorerMutationsOptions {
  side: 'local' | 'remote'
  currentPath: string
  rootPath: string
  serverId: string | null
  canMutate: boolean
  onRefresh: () => void
}

export function useExplorerMutations({
  side,
  currentPath,
  rootPath,
  serverId,
  canMutate,
  onRefresh,
}: UseExplorerMutationsOptions) {
  const isLocal = side === 'local'
  const { openFile } = useEditorActions()
  const [nameModal, setNameModal] = useState<NameModalState | null>(null)
  const [saving, setSaving] = useState(false)

  const closeNameModal = useCallback(() => setNameModal(null), [])

  const startMkdir = useCallback(() => {
    if (!canMutate) return
    setNameModal({ mode: 'mkdir', initialName: '' })
  }, [canMutate])

  const startTouch = useCallback(() => {
    if (!canMutate) return
    setNameModal({ mode: 'touch', initialName: '' })
  }, [canMutate])

  const startRename = useCallback(
    (node: FileTreeNode) => {
      if (!canMutate) return
      setNameModal({ mode: 'rename', initialName: node.name, targetNode: node })
    },
    [canMutate],
  )

  const deleteNode = useCallback(
    async (node: FileTreeNode) => {
      if (!canMutate) return

      const message =
        node.type === 'directory'
          ? `Delete folder "${node.name}" and everything inside it?`
          : `Delete file "${node.name}"?`
      const confirmed = window.confirm(message)
      if (!confirmed) return

      try {
        if (isLocal) {
          await deleteLocalEntry(node.path, node.type)
        } else if (serverId) {
          await deleteRemoteEntry(serverId, node.path, node.type)
        } else {
          throw new Error('No server selected')
        }

        notifications.show({
          title: 'Deleted',
          message: node.name,
          color: 'green',
          autoClose: 2200,
        })
        onRefresh()
      } catch (error) {
        notifications.show({
          title: 'Delete failed',
          message: error instanceof Error ? error.message : 'Unknown error',
          color: 'red',
        })
      }
    },
    [canMutate, isLocal, onRefresh, serverId],
  )

  const submitName = useCallback(
    async (name: string) => {
      if (!nameModal || !canMutate) return

      const trimmed = name.trim()
      if (!trimmed) {
        notifications.show({
          title: 'Invalid name',
          message: 'Enter a file or folder name',
          color: 'orange',
        })
        return
      }

      setSaving(true)

      try {
        if (nameModal.mode === 'mkdir') {
          if (isLocal) {
            await mkdirLocalDirectory(currentPath, trimmed)
          } else if (serverId) {
            await mkdirRemoteDirectory(serverId, currentPath, trimmed)
          } else {
            throw new Error('No server selected')
          }

          notifications.show({
            title: 'Folder created',
            message: trimmed,
            color: 'green',
            autoClose: 2200,
          })
        } else if (nameModal.mode === 'touch') {
          let filePath: string

          if (isLocal) {
            filePath = await createLocalFile(currentPath, trimmed)
          } else if (serverId) {
            filePath = await createRemoteFile(serverId, currentPath, trimmed)
          } else {
            throw new Error('No server selected')
          }

          notifications.show({
            title: 'File created',
            message: trimmed,
            color: 'green',
            autoClose: 2200,
          })

          closeNameModal()
          onRefresh()
          await openFile({
            path: filePath,
            side: isLocal ? 'local' : 'remote',
            serverId: isLocal ? null : serverId,
          })
          return
        } else {
          const target = nameModal.targetNode
          if (!target) {
            throw new Error('Nothing to rename')
          }

          const nextPath = buildRenamedExplorerPath(target.path, trimmed, rootPath)

          if (isLocal) {
            await renameLocalEntry(target.path, nextPath)
          } else if (serverId) {
            await renameRemoteEntry(serverId, target.path, nextPath)
          } else {
            throw new Error('No server selected')
          }

          notifications.show({
            title: 'Renamed',
            message: `${target.name} → ${trimmed}`,
            color: 'green',
            autoClose: 2200,
          })
        }

        closeNameModal()
        onRefresh()
      } catch (error) {
        const titles: Record<NameModalMode, string> = {
          mkdir: 'Create folder failed',
          touch: 'Create file failed',
          rename: 'Rename failed',
        }

        notifications.show({
          title: titles[nameModal.mode],
          message: error instanceof Error ? error.message : 'Unknown error',
          color: 'red',
        })
      } finally {
        setSaving(false)
      }
    },
    [
      canMutate,
      closeNameModal,
      currentPath,
      isLocal,
      nameModal,
      onRefresh,
      openFile,
      rootPath,
      serverId,
    ],
  )

  return {
    nameModal,
    saving,
    actions: {
      startMkdir,
      startTouch,
      startRename,
      deleteNode,
      submitName,
      closeNameModal,
    },
  }
}
