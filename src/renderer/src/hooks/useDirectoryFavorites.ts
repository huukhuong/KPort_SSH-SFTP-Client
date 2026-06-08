import { useEffect } from 'react'
import type { FavoriteDirectoryRecord } from '../../../shared/productivity'
import { useDirectoryFavoritesStore } from '../stores/directoryFavoritesStore'

const EMPTY_FAVORITES: FavoriteDirectoryRecord[] = []

export function useDirectoryFavorites(serverId: string | null) {
  const favorites = useDirectoryFavoritesStore((state) => {
    if (!serverId) return EMPTY_FAVORITES
    return state.cache[serverId] ?? EMPTY_FAVORITES
  })
  const loading = useDirectoryFavoritesStore(
    (state) => state.loadingServerId === serverId && serverId !== null,
  )
  const load = useDirectoryFavoritesStore((state) => state.load)
  const addFavorite = useDirectoryFavoritesStore((state) => state.add)
  const removeFavorite = useDirectoryFavoritesStore((state) => state.remove)

  useEffect(() => {
    void load(serverId)
  }, [load, serverId])

  return {
    favorites,
    loading,
    addFavorite: (path: string, label?: string) => {
      if (!serverId) return Promise.resolve()
      return addFavorite(serverId, path, label)
    },
    removeFavorite: (id: string) => {
      if (!serverId) return Promise.resolve()
      return removeFavorite(id, serverId)
    },
    refresh: () => load(serverId),
  }
}
