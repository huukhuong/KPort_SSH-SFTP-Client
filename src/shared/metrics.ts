export interface ServerMetrics {
  cpuPercent: number
  ramUsedGb: number
  ramTotalGb: number
  diskUsedGb: number
  diskTotalGb: number
  loadAverage: number
}

export const METRICS_POLL_INTERVAL_MS = 3000
