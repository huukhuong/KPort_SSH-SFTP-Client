import { useDisclosure } from '@mantine/hooks'
import { useCallback, useState } from 'react'
import type { Server } from '../types'

export function useServerModal() {
  const [opened, { open, close }] = useDisclosure(false)
  const [editingServer, setEditingServer] = useState<Server | null>(null)

  const openAdd = useCallback(() => {
    setEditingServer(null)
    open()
  }, [open])

  const openEdit = useCallback(
    (server: Server) => {
      setEditingServer(server)
      open()
    },
    [open],
  )

  const closeModal = useCallback(() => {
    close()
    setEditingServer(null)
  }, [close])

  return {
    opened,
    editingServer,
    actions: {
      openAdd,
      openEdit,
      close: closeModal,
    },
  }
}
