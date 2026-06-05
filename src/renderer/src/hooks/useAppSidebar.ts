import { notifications } from '@mantine/notifications'
import { useCallback, useMemo } from 'react'
import { mockFavorites } from '../mocks/favorites'
import { mockQuickCommands } from '../mocks/quickCommands'
import { useTerminal } from '../providers/TerminalProvider'
import { useExplorerStore } from '../stores/explorerStore'
import { useServerStore } from '../stores/serverStore'

export function useAppSidebar() {
  const servers = useServerStore((state) => state.servers)
  const activeServerId = useServerStore((state) => state.activeServerId)
  const loading = useServerStore((state) => state.loading)
  const error = useServerStore((state) => state.error)
  const setActiveServer = useServerStore((state) => state.setActiveServer)
  const connectToServerStore = useServerStore((state) => state.connectToServer)
  const toggleFavoriteStore = useServerStore((state) => state.toggleFavorite)
  const navigateRemote = useExplorerStore((state) => state.navigateRemote)
  const { injectCommand } = useTerminal()

  const navigateFavorite = useCallback(
    (path: string) => {
      navigateRemote(path)
    },
    [navigateRemote],
  )

  const favorites = useMemo(
    () => mockFavorites.filter((item) => item.serverId === activeServerId),
    [activeServerId],
  )

  const toggleFavorite = useCallback(
    async (id: string) => {
      try {
        await toggleFavoriteStore(id)
      } catch (err) {
        notifications.show({
          title: 'Favorite update failed',
          message: err instanceof Error ? err.message : 'Could not update favorite',
          color: 'red',
        })
      }
    },
    [toggleFavoriteStore],
  )

  const connectToServer = useCallback(
    async (id: string) => {
      try {
        await connectToServerStore(id)
      } catch (err) {
        notifications.show({
          title: 'Connection failed',
          message: err instanceof Error ? err.message : 'Could not connect to server',
          color: 'red',
        })
      }
    },
    [connectToServerStore],
  )

  return {
    servers,
    activeServerId,
    loading,
    error,
    isEmpty: !loading && !error && servers.length === 0,
    favorites,
    quickCommands: mockQuickCommands,
    actions: {
      setActiveServer,
      connectToServer,
      toggleFavorite,
      navigateFavorite,
      injectCommand,
    },
  }
}
