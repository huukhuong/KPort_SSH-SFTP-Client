import { notifications } from '@mantine/notifications'
import { useCallback, useEffect, useState } from 'react'
import type { FavoriteDirectoryRecord } from '../../../shared/productivity'
import {
  addFavoriteDirectory,
  listFavoriteDirectories,
  removeFavoriteDirectory,
} from '../services/favorites'

export function useDirectoryFavorites(serverId: string | null) {
  const [favorites, setFavorites] = useState<FavoriteDirectoryRecord[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!serverId) {
      setFavorites([])
      return
    }

    setLoading(true)
    try {
      const items = await listFavoriteDirectories(serverId)
      setFavorites(items)
    } catch (error) {
      notifications.show({
        title: 'Failed to load favorites',
        message: error instanceof Error ? error.message : 'Unknown error',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }, [serverId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const addFavorite = useCallback(
    async (path: string, label?: string) => {
      if (!serverId) return

      try {
        await addFavoriteDirectory({ serverId, path, label })
        await refresh()
        notifications.show({
          title: 'Added to favorites',
          message: path,
          color: 'green',
          autoClose: 2200,
        })
      } catch (error) {
        notifications.show({
          title: 'Could not add favorite',
          message: error instanceof Error ? error.message : 'Unknown error',
          color: 'red',
        })
      }
    },
    [refresh, serverId],
  )

  const removeFavorite = useCallback(
    async (id: string) => {
      try {
        await removeFavoriteDirectory(id)
        await refresh()
      } catch (error) {
        notifications.show({
          title: 'Could not remove favorite',
          message: error instanceof Error ? error.message : 'Unknown error',
          color: 'red',
        })
      }
    },
    [refresh],
  )

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    refresh,
  }
}
