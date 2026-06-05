import { useCallback } from 'react'
import { useTerminal } from '../providers/TerminalProvider'
import { useServerStore } from '../stores/serverStore'

export function useTerminalPanel() {
  const terminal = useTerminal()
  const servers = useServerStore((state) => state.servers)

  const isTabConnected = useCallback(
    (serverId: string | null) => {
      if (!serverId) return false
      return servers.find((server) => server.id === serverId)?.status === 'connected'
    },
    [servers],
  )

  return {
    tabs: terminal.tabs,
    activeTabId: terminal.activeTabId,
    isTabConnected,
    actions: {
      setActiveTabId: terminal.setActiveTabId,
      addTab: terminal.addTab,
      removeTab: terminal.removeTab,
      registerTerminalId: terminal.registerTerminalId,
      unregisterTerminalId: terminal.unregisterTerminalId,
    },
  }
}
