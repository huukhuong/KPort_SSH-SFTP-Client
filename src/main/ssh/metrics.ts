import type { ServerMetrics } from '../../shared/metrics'
import { connectionManager } from './connection-manager'

const METRICS_SHELL = `
load=$(awk '{print $1}' /proc/loadavg)
set -- $(free -b | awk '/Mem:/ {print $3, $2}')
ram_used=$1
ram_total=$2
set -- $(df -B1 / | awk 'NR==2 {print $3, $2}')
disk_used=$1
disk_total=$2
read -r idle1 total1 <<< "$(awk '/^cpu / {idle=$5; total=0; for (i=2; i<=NF; i++) total+=$i; print idle, total}' /proc/stat)"
sleep 0.3
read -r idle2 total2 <<< "$(awk '/^cpu / {idle=$5; total=0; for (i=2; i<=NF; i++) total+=$i; print idle, total}' /proc/stat)"
cpu=$(awk -v t1="$total1" -v t2="$total2" -v i1="$idle1" -v i2="$idle2" 'BEGIN {
  delta=t2-t1
  if (delta <= 0) { print 0; exit }
  printf "%.0f", 100 * (1 - (i2 - i1) / delta)
}')
printf '{"loadAverage":%s,"ramUsedBytes":%s,"ramTotalBytes":%s,"diskUsedBytes":%s,"diskTotalBytes":%s,"cpuPercent":%s}\\n' "$load" "$ram_used" "$ram_total" "$disk_used" "$disk_total" "$cpu"
`.trim()

interface RawMetricsPayload {
  loadAverage: number
  ramUsedBytes: number
  ramTotalBytes: number
  diskUsedBytes: number
  diskTotalBytes: number
  cpuPercent: number
}

function bytesToGb(bytes: number): number {
  return Math.round((bytes / 1024 ** 3) * 10) / 10
}

function normalizeMetrics(raw: RawMetricsPayload): ServerMetrics {
  return {
    cpuPercent: Math.max(0, Math.min(100, Math.round(raw.cpuPercent))),
    ramUsedGb: bytesToGb(raw.ramUsedBytes),
    ramTotalGb: bytesToGb(raw.ramTotalBytes),
    diskUsedGb: bytesToGb(raw.diskUsedBytes),
    diskTotalGb: bytesToGb(raw.diskTotalBytes),
    loadAverage: Math.round(raw.loadAverage * 100) / 100,
  }
}

export async function collectServerMetrics(serverId: string): Promise<ServerMetrics> {
  const output = await connectionManager.exec(serverId, METRICS_SHELL)
  const line = output
    .split('\n')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith('{'))
    ?? output.trim()

  const parsed = JSON.parse(line) as RawMetricsPayload

  return normalizeMetrics(parsed)
}
