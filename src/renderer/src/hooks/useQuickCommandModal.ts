import { useDisclosure } from '@mantine/hooks'
import { useCallback, useState } from 'react'
import type { QuickCommandRecord } from '../../../shared/productivity'

export function useQuickCommandModal() {
  const [opened, { open, close }] = useDisclosure(false)
  const [editingCommand, setEditingCommand] = useState<QuickCommandRecord | null>(null)

  const openAdd = useCallback(() => {
    setEditingCommand(null)
    open()
  }, [open])

  const openEdit = useCallback(
    (command: QuickCommandRecord) => {
      setEditingCommand(command)
      open()
    },
    [open],
  )

  const closeModal = useCallback(() => {
    close()
    setEditingCommand(null)
  }, [close])

  return {
    opened,
    editingCommand,
    actions: {
      openAdd,
      openEdit,
      close: closeModal,
    },
  }
}
