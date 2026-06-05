import { Badge, Burger, Group, Text, ThemeIcon } from '@mantine/core'
import {
  IconActivity,
  IconCpu,
  IconDatabase,
  IconDeviceSdCard,
  IconPlugConnected,
  IconServer,
} from '@tabler/icons-react'

interface AppHeaderProps {
  onToggleSidebar?: () => void
  sidebarOpened?: boolean
}

export function AppHeader({ onToggleSidebar, sidebarOpened = true }: AppHeaderProps) {
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
            Production
          </Text>
          <Group gap={6}>
            <IconPlugConnected size={12} color="var(--mantine-color-green-5)" />
            <Text size="xs" c="dimmed">
              deploy@prod.example.com
            </Text>
          </Group>
        </div>
      </Group>

      <Group gap="xs" wrap="nowrap">
        <MetricBadge icon={<IconCpu size={12} />} label="CPU" value="23%" />
        <MetricBadge icon={<IconDeviceSdCard size={12} />} label="RAM" value="4.2 / 8 GB" />
        <MetricBadge icon={<IconDatabase size={12} />} label="Disk" value="42 / 100 GB" />
        <MetricBadge icon={<IconActivity size={12} />} label="Load" value="0.72" />
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
