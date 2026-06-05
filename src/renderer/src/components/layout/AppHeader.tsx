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
  const { serverName, connectionLabel, connectionStatusColor, metrics } = useAppHeader()

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

      <Group gap="xs" wrap="nowrap">
        <MetricBadge icon={<IconCpu size={12} />} label="CPU" value={`${metrics.cpuPercent}%`} />
        <MetricBadge
          icon={<IconDeviceSdCard size={12} />}
          label="RAM"
          value={`${metrics.ramUsedGb} / ${metrics.ramTotalGb} GB`}
        />
        <MetricBadge
          icon={<IconDatabase size={12} />}
          label="Disk"
          value={`${metrics.diskUsedGb} / ${metrics.diskTotalGb} GB`}
        />
        <MetricBadge icon={<IconActivity size={12} />} label="Load" value={`${metrics.loadAverage}`} />
      </Group>
    </Group>
  )
}

function MetricBadge({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <Badge
      variant="light"
      color="gray"
      leftSection={icon}
      styles={{ root: { textTransform: 'none', fontWeight: 500 } }}
    >
      {label}: {value}
    </Badge>
  )
}
