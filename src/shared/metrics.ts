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

export const METRIC_THRESHOLDS = {
  cpuPercent: 90,
  ramPercent: 85,
  diskPercent: 90,
  loadAverage: 4,
} as const

export interface MetricWarnings {
  cpu: boolean
  ram: boolean
  load: boolean
  disks: Record<string, boolean>
}

export function getMetricWarnings(metrics: ServerMetrics): MetricWarnings {
  const ramPercent =
    metrics.ramTotalGb > 0 ? (metrics.ramUsedGb / metrics.ramTotalGb) * 100 : 0

  const disks: Record<string, boolean> = {}
  for (const disk of metrics.disks) {
    const usedPercent = disk.totalGb > 0 ? (disk.usedGb / disk.totalGb) * 100 : 0
    disks[disk.mount] = usedPercent >= METRIC_THRESHOLDS.diskPercent
  }

  return {
    cpu: metrics.cpuPercent >= METRIC_THRESHOLDS.cpuPercent,
    ram: ramPercent >= METRIC_THRESHOLDS.ramPercent,
    load: metrics.loadAverage >= METRIC_THRESHOLDS.loadAverage,
    disks,
  }
}
