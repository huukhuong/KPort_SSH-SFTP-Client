import { useMemo } from 'react'
import { mockFavorites } from '../mocks/favorites'
import { mockQuickCommands } from '../mocks/quickCommands'
import { useTerminal } from '../providers/TerminalProvider'
import { useExplorerStore } from '../stores/explorerStore'
import { useServerStore } from '../stores/serverStore'

export function useAppSidebar() {
  const servers = useServerStore((state) => state.servers)
  const activeServerId = useServerStore((state) => state.activeServerId)
  const setActiveServer = useServerStore((state) => state.setActiveServer)
  const toggleFavorite = useServerStore((state) => state.toggleFavorite)
  const navigateRemote = useExplorerStore((state) => state.navigateRemote)
  const { injectCommand } = useTerminal()

  const favorites = useMemo(
    () => mockFavorites.filter((item) => item.serverId === activeServerId),
    [activeServerId],
  )

  return {
    servers,
    activeServerId,
    favorites,
    quickCommands: mockQuickCommands,
    actions: {
      setActiveServer,
      toggleFavorite,
      navigateRemote,
      injectCommand,
    },
  }
}
