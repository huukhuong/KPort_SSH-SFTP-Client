import { useMemo } from 'react'
import { mockMetrics } from '../mocks/metrics'
import { useServerStore } from '../stores/serverStore'
import type { ServerStatus } from '../types'

function getConnectionStatusColor(status?: ServerStatus): string {
  if (status === 'connected') return 'var(--mantine-color-green-5)'
  if (status === 'connecting') return 'var(--mantine-color-yellow-5)'
  return 'var(--mantine-color-gray-5)'
}

export function useAppHeader() {
  const servers = useServerStore((state) => state.servers)
  const activeServerId = useServerStore((state) => state.activeServerId)

  const activeServer = useMemo(
    () => servers.find((server) => server.id === activeServerId),
    [servers, activeServerId],
  )

  const connectionLabel = !activeServer
    ? 'Select a server'
    : activeServer.status === 'connected'
      ? `${activeServer.username}@${activeServer.host}`
      : activeServer.status === 'connecting'
        ? 'Connecting...'
        : 'Double-click server to connect'

  return {
    serverName: activeServer?.name ?? 'No server selected',
    connectionLabel,
    connectionStatusColor: getConnectionStatusColor(activeServer?.status),
    isConnected: activeServer?.status === 'connected',
    metrics: mockMetrics,
  }
}
