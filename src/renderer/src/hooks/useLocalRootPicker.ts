import { notifications } from '@mantine/notifications'
import { useCallback } from 'react'
import { pickLocalDirectory } from '../services/dialog'
import { useExplorerStore } from '../stores/explorerStore'

export function useLocalRootPicker() {
  const setLocalRoot = useExplorerStore((state) => state.setLocalRoot)

  const pickLocalRoot = useCallback(async () => {
    try {
      const directory = await pickLocalDirectory()
      if (!directory) return

      setLocalRoot(directory)
      notifications.show({
        title: 'Local root updated',
        message: directory,
        color: 'green',
        autoClose: 2200,
      })
    } catch (error) {
      notifications.show({
        title: 'Could not change local root',
        message: error instanceof Error ? error.message : 'Unknown error',
        color: 'red',
      })
    }
  }, [setLocalRoot])

  return { pickLocalRoot }
}
