import {
  DISK_METRICS_MIN_TOTAL_BYTES,
  type DiskMetrics,
  type ServerMetrics,
} from '../../shared/metrics'
import { connectionManager } from './connection-manager'

const METRICS_SHELL = `
load=$(awk '{print $1}' /proc/loadavg)
set -- $(free -b | awk '/Mem:/ {print $3, $2}')
ram_used=$1
ram_total=$2
disks=$(df -B1 -P -x tmpfs -x devtmpfs -x squashfs -x overlay -x efivarfs 2>/dev/null | awk 'NR>1 {
  gsub(/"/, "\\\\\\"", $6)
  printf "%s{\\"mount\\":\\"%s\\",\\"usedBytes\\":%s,\\"totalBytes\\":%s}", (NR>2?",":""), $6, $3, $2
}')
read -r idle1 total1 <<< "$(awk '/^cpu / {idle=$5; total=0; for (i=2; i<=NF; i++) total+=$i; print idle, total}' /proc/stat)"
sleep 0.3
read -r idle2 total2 <<< "$(awk '/^cpu / {idle=$5; total=0; for (i=2; i<=NF; i++) total+=$i; print idle, total}' /proc/stat)"
cpu=$(awk -v t1="$total1" -v t2="$total2" -v i1="$idle1" -v i2="$idle2" 'BEGIN {
  delta=t2-t1
  if (delta <= 0) { print 0; exit }
  printf "%.0f", 100 * (1 - (i2 - i1) / delta)
}')
printf '{"loadAverage":%s,"ramUsedBytes":%s,"ramTotalBytes":%s,"cpuPercent":%s,"disks":[%s]}\\n' "$load" "$ram_used" "$ram_total" "$cpu" "$disks"
`.trim()

interface RawDiskPayload {
  mount: string
  usedBytes: number
  totalBytes: number
}

interface RawMetricsPayload {
  loadAverage: number
  ramUsedBytes: number
  ramTotalBytes: number
  cpuPercent: number
  disks: RawDiskPayload[]
}

function bytesToGb(bytes: number): number {
  return Math.round((bytes / 1024 ** 3) * 10) / 10
}

function sortDisks(disks: DiskMetrics[]): DiskMetrics[] {
  return [...disks].sort((a, b) => {
    if (a.mount === '/') return -1
    if (b.mount === '/') return 1
    return a.mount.localeCompare(b.mount)
  })
}

function normalizeMetrics(raw: RawMetricsPayload): ServerMetrics {
  const disks = sortDisks(
    (raw.disks ?? [])
      .filter((disk) => disk.totalBytes > DISK_METRICS_MIN_TOTAL_BYTES)
      .map((disk) => ({
        mount: disk.mount,
        usedGb: bytesToGb(disk.usedBytes),
        totalGb: bytesToGb(disk.totalBytes),
      })),
  )

  return {
    cpuPercent: Math.max(0, Math.min(100, Math.round(raw.cpuPercent))),
    ramUsedGb: bytesToGb(raw.ramUsedBytes),
    ramTotalGb: bytesToGb(raw.ramTotalBytes),
    disks,
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
