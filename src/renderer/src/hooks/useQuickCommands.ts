import { notifications } from '@mantine/notifications'
import { useCallback, useEffect, useState } from 'react'
import type { QuickCommandRecord } from '../../../shared/productivity'
import { listQuickCommands } from '../services/quickCommands'

export function useQuickCommands() {
  const [commands, setCommands] = useState<QuickCommandRecord[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const items = await listQuickCommands()
      setCommands(items)
    } catch (error) {
      notifications.show({
        title: 'Failed to load quick commands',
        message: error instanceof Error ? error.message : 'Unknown error',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { commands, loading, refresh }
}
