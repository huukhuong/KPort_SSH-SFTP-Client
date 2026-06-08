import { useCallback } from 'react'
import { useDirectoryFavoritesStore } from '../stores/directoryFavoritesStore'

export function useAddDirectoryFavorite(serverId: string | null) {
  const add = useDirectoryFavoritesStore((state) => state.add)

  return useCallback(
    (path: string, label?: string) => {
      if (!serverId) return Promise.resolve()
      return add(serverId, path, label)
    },
    [add, serverId],
  )
}
