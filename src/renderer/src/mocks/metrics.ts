import type { ServerMetrics } from '../types'

export const mockMetrics: ServerMetrics = {
  cpuPercent: 23,
  ramUsedGb: 4.2,
  ramTotalGb: 8,
  disks: [{ mount: '/', usedGb: 42, totalGb: 100 }],
  loadAverage: 0.72,
}
