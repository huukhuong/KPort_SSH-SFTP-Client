export interface DiskMetrics {
  mount: string
  usedGb: number
  totalGb: number
}

export interface ServerMetrics {
  cpuPercent: number
  ramUsedGb: number
  ramTotalGb: number
  disks: DiskMetrics[]
  loadAverage: number
}

export const METRICS_POLL_INTERVAL_MS = 3000
export const DISK_METRICS_MIN_TOTAL_BYTES = 5 * 1024 ** 3
