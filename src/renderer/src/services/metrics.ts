import type { ServerMetrics } from '../../../shared/metrics'

export function getServerMetrics(serverId: string): Promise<ServerMetrics> {
  return window.kport.ssh.getMetrics(serverId)
}
