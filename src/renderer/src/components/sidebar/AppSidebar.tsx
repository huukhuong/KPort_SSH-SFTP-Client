import {
  ActionIcon,
  Button,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core'
import {
  IconBolt,
  IconFolder,
  IconPlus,
  IconServer,
  IconStar,
  IconTerminal2,
} from '@tabler/icons-react'
import classes from '../../styles/layout.module.css'

interface AppSidebarProps {
  onAddServer?: () => void
}

export function AppSidebar({ onAddServer }: AppSidebarProps) {
  return (
    <Stack gap={0} h="100%">
      <Group px="sm" py="sm" justify="space-between" className={classes.sidebarBrand}>
        <Group gap="xs">
          <ThemeIcon variant="light" size="sm">
            <IconServer size={14} />
          </ThemeIcon>
          <Text size="sm" fw={700}>
            KPort
          </Text>
        </Group>
        <ActionIcon variant="light" color="blue" size="sm" aria-label="Add server" onClick={onAddServer}>
          <IconPlus size={14} />
        </ActionIcon>
      </Group>

      <ScrollArea flex={1} type="auto" offsetScrollbars>
        <div className={classes.sidebarSection}>
          <Text px="sm" py={4} size="xs" fw={700} tt="uppercase" className={classes.sidebarSectionLabel}>
            Servers
          </Text>
          <NavLink
            label="Production"
            description="prod.example.com"
            leftSection={<StatusDot color="green" />}
            active
          />
          <NavLink
            label="Staging"
            description="staging.example.com"
            leftSection={<StatusDot color="gray" />}
          />
          <NavLink
            label="Personal VPS"
            description="vps.example.com"
            leftSection={<StatusDot color="gray" />}
            rightSection={<IconStar size={14} color="var(--mantine-color-yellow-5)" />}
          />
        </div>

        <div className={classes.sidebarSection}>
          <Text px="sm" py={4} size="xs" fw={700} tt="uppercase" className={classes.sidebarSectionLabel}>
            Favorites
          </Text>
          <NavLink label="/var/www" leftSection={<IconFolder size={16} />} />
          <NavLink label="/etc/nginx" leftSection={<IconFolder size={16} />} />
          <NavLink label="/var/log" leftSection={<IconFolder size={16} />} />
        </div>

        <div className={classes.sidebarSection}>
          <Text px="sm" py={4} size="xs" fw={700} tt="uppercase" className={classes.sidebarSectionLabel}>
            Quick Commands
          </Text>
          <NavLink label="docker ps" leftSection={<IconTerminal2 size={16} />} />
          <NavLink label="pm2 status" leftSection={<IconTerminal2 size={16} />} />
          <NavLink label="nginx -t" leftSection={<IconBolt size={16} />} />
        </div>
      </ScrollArea>

      <Stack p="sm" gap="xs">
        <Button leftSection={<IconPlus size={16} />} variant="filled" color="blue" fullWidth onClick={onAddServer}>
          Add Server
        </Button>
      </Stack>
    </Stack>
  )
}

function StatusDot({ color }: { color: 'green' | 'gray' | 'red' }) {
  const map = {
    green: 'var(--mantine-color-green-5)',
    gray: 'var(--mantine-color-gray-5)',
    red: 'var(--mantine-color-red-5)',
  }

  return (
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: map[color],
      }}
    />
  )
}
