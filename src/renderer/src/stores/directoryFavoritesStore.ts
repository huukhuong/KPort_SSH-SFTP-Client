import { notifications } from '@mantine/notifications'
import { create } from 'zustand'
import type { FavoriteDirectoryRecord } from '../../../shared/productivity'
import {
  addFavoriteDirectory,
  listFavoriteDirectories,
  removeFavoriteDirectory,
} from '../services/favorites'

interface DirectoryFavoritesStore {
  cache: Record<string, FavoriteDirectoryRecord[]>
  loadingServerId: string | null
  load: (serverId: string | null) => Promise<void>
  add: (serverId: string, path: string, label?: string) => Promise<void>
  remove: (id: string, serverId: string) => Promise<void>
}

export const useDirectoryFavoritesStore = create<DirectoryFavoritesStore>((set, get) => ({
  cache: {},
  loadingServerId: null,

  load: async (serverId) => {
    if (!serverId) return

    set({ loadingServerId: serverId })
    try {
      const items = await listFavoriteDirectories(serverId)
      set((state) => ({
        cache: { ...state.cache, [serverId]: items },
      }))
    } catch (error) {
      notifications.show({
        title: 'Failed to load favorites',
        message: error instanceof Error ? error.message : 'Unknown error',
        color: 'red',
      })
    } finally {
      set((state) =>
        state.loadingServerId === serverId ? { loadingServerId: null } : state,
      )
    }
  },

  add: async (serverId, path, label) => {
    try {
      await addFavoriteDirectory({ serverId, path, label })
      await get().load(serverId)
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

  remove: async (id, serverId) => {
    try {
      await removeFavoriteDirectory(id)
      await get().load(serverId)
    } catch (error) {
      notifications.show({
        title: 'Could not remove favorite',
        message: error instanceof Error ? error.message : 'Unknown error',
        color: 'red',
      })
    }
  },
}))
