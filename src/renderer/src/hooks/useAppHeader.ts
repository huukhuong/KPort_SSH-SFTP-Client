import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { METRICS_POLL_INTERVAL_MS } from '../../../shared/metrics'
import type { ServerMetrics } from '../../../shared/metrics'
import { getServerMetrics } from '../services/metrics'
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
  const [metrics, setMetrics] = useState<ServerMetrics | null>(null)
  const [metricsLoading, setMetricsLoading] = useState(false)
  const metricsRequestId = useRef(0)

  const activeServer = useMemo(
    () => servers.find((server) => server.id === activeServerId),
    [servers, activeServerId],
  )

  const isConnected = activeServer?.status === 'connected'

  const connectionLabel = !activeServer
    ? 'Select a server'
    : activeServer.status === 'connected'
      ? `${activeServer.username}@${activeServer.host}`
      : activeServer.status === 'connecting'
        ? 'Connecting...'
        : 'Double-click server to connect'

  const refreshMetrics = useCallback(async () => {
    if (!activeServerId || !isConnected) return

    const requestId = ++metricsRequestId.current
    setMetricsLoading(true)

    try {
      const nextMetrics = await getServerMetrics(activeServerId)
      if (requestId === metricsRequestId.current) {
        setMetrics(nextMetrics)
      }
    } catch (error) {
      console.error('[KPort] Failed to load server metrics:', error)
    } finally {
      if (requestId === metricsRequestId.current) {
        setMetricsLoading(false)
      }
    }
  }, [activeServerId, isConnected])

  useEffect(() => {
    if (!activeServerId || !isConnected) {
      metricsRequestId.current += 1
      setMetrics(null)
      setMetricsLoading(false)
      return
    }

    void refreshMetrics()

    const intervalId = window.setInterval(() => {
      void refreshMetrics()
    }, METRICS_POLL_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [activeServerId, isConnected, refreshMetrics])

  return {
    serverName: activeServer?.name ?? 'No server selected',
    connectionLabel,
    connectionStatusColor: getConnectionStatusColor(activeServer?.status),
    isConnected,
    metrics,
    metricsLoading,
  }
}
