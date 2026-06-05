import { Badge, Burger, Group, Text, ThemeIcon } from '@mantine/core'
import {
  IconActivity,
  IconCpu,
  IconDatabase,
  IconDeviceSdCard,
  IconPlugConnected,
  IconServer,
} from '@tabler/icons-react'
import { mockMetrics } from '../../mocks/metrics'
import { useServerStore } from '../../stores/serverStore'

interface AppHeaderProps {
  onToggleSidebar?: () => void
  sidebarOpened?: boolean
}

export function AppHeader({ onToggleSidebar, sidebarOpened = true }: AppHeaderProps) {
  const servers = useServerStore((state) => state.servers)
  const activeServerId = useServerStore((state) => state.activeServerId)
  const activeServer = servers.find((server) => server.id === activeServerId)
  const isConnected = activeServer?.status === 'connected'

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
            {activeServer?.name ?? 'No server'}
          </Text>
          <Group gap={6}>
            <IconPlugConnected
              size={12}
              color={
                isConnected
                  ? 'var(--mantine-color-green-5)'
                  : activeServer?.status === 'connecting'
                    ? 'var(--mantine-color-yellow-5)'
                    : 'var(--mantine-color-gray-5)'
              }
            />
            <Text size="xs" c="dimmed">
              {activeServer
                ? `${activeServer.username}@${activeServer.host}`
                : 'Select a server'}
            </Text>
          </Group>
        </div>
      </Group>

      <Group gap="xs" wrap="nowrap">
        <MetricBadge icon={<IconCpu size={12} />} label="CPU" value={`${mockMetrics.cpuPercent}%`} />
        <MetricBadge
          icon={<IconDeviceSdCard size={12} />}
          label="RAM"
          value={`${mockMetrics.ramUsedGb} / ${mockMetrics.ramTotalGb} GB`}
        />
        <MetricBadge
          icon={<IconDatabase size={12} />}
          label="Disk"
          value={`${mockMetrics.diskUsedGb} / ${mockMetrics.diskTotalGb} GB`}
        />
        <MetricBadge icon={<IconActivity size={12} />} label="Load" value={`${mockMetrics.loadAverage}`} />
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
