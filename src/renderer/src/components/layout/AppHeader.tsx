import { Badge, Burger, Group, Text, ThemeIcon } from '@mantine/core'
import {
  IconActivity,
  IconCpu,
  IconDatabase,
  IconDeviceSdCard,
  IconPlugConnected,
  IconServer,
} from '@tabler/icons-react'
import { useAppHeader } from '../../hooks/useAppHeader'

interface AppHeaderProps {
  onToggleSidebar?: () => void
  sidebarOpened?: boolean
}

export function AppHeader({ onToggleSidebar, sidebarOpened = true }: AppHeaderProps) {
  const { serverName, connectionLabel, connectionStatusColor, isConnected, metrics, metricsLoading } =
    useAppHeader()

  return (
    <Group h="100%" px="md" justify="space-between" wrap="nowrap">
      <Group gap="sm" wrap="nowrap">
        {onToggleSidebar && (
          <Burger opened={sidebarOpened} onClick={onToggleSidebar} size="sm" aria-label="Toggle sidebar" />
        )}
        <ThemeIcon variant="light" size="md">
          <IconServer size={16} />
        </ThemeIcon>
        <div>
          <Text size="sm" fw={600} lh={1.2}>
            {serverName}
          </Text>
          <Group gap={6}>
            <IconPlugConnected size={12} color={connectionStatusColor} />
            <Text size="xs" c="dimmed">
              {connectionLabel}
            </Text>
          </Group>
        </div>
      </Group>

      <Group
        gap="xs"
        wrap="nowrap"
        style={{ flexShrink: 1, maxWidth: '58%', overflowX: 'auto', scrollbarWidth: 'thin' }}
      >
        <MetricBadge
          icon={<IconCpu size={12} />}
          label="CPU"
          value={formatMetricValue(isConnected, metrics?.cpuPercent, (value) => `${value}%`)}
          loading={metricsLoading && !metrics}
        />
        <MetricBadge
          icon={<IconDeviceSdCard size={12} />}
          label="RAM"
          value={formatMetricValue(
            isConnected,
            metrics,
            (value) => `${value.ramUsedGb} / ${value.ramTotalGb} GB`,
          )}
          loading={metricsLoading && !metrics}
        />
        {isConnected && metrics && metrics.disks.length > 0
          ? metrics.disks.map((disk) => (
              <MetricBadge
                key={disk.mount}
                icon={<IconDatabase size={12} />}
                label={formatDiskLabel(disk.mount)}
                value={`${disk.usedGb} / ${disk.totalGb} GB`}
              />
            ))
          : (
              <MetricBadge
                icon={<IconDatabase size={12} />}
                label="Disk"
                value={!isConnected ? '—' : metricsLoading && !metrics ? '…' : '—'}
                loading={metricsLoading && !metrics}
              />
            )}
        <MetricBadge
          icon={<IconActivity size={12} />}
          label="Load"
          value={formatMetricValue(isConnected, metrics?.loadAverage, (value) => `${value}`)}
          loading={metricsLoading && !metrics}
        />
      </Group>
    </Group>
  )
}

function formatDiskLabel(mount: string): string {
  return mount === '/' ? 'Disk /' : mount
}

function formatMetricValue<T>(
  isConnected: boolean,
  value: T | null | undefined,
  format: (value: T) => string,
): string {
  if (!isConnected) return '—'
  if (value == null) return '…'
  return format(value)
}

function MetricBadge({
  icon,
  label,
  value,
  loading = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  loading?: boolean
}) {
  return (
    <Badge
      variant="light"
      color="gray"
      leftSection={icon}
      styles={{ root: { textTransform: 'none', fontWeight: 500, opacity: loading ? 0.7 : 1 } }}
    >
      {label}: {value}
    </Badge>
  )
}
