import type { ServerMetrics } from '../types'

export const mockMetrics: ServerMetrics = {
  cpuPercent: 23,
  ramUsedGb: 4.2,
  ramTotalGb: 8,
  diskUsedGb: 42,
  diskTotalGb: 100,
  loadAverage: 0.72,
}
