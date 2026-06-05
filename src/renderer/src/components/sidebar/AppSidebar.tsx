import {
  ActionIcon,
  Button,
  Center,
  Group,
  Loader,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core'
import {
  IconBolt,
  IconEdit,
  IconFolder,
  IconPlus,
  IconServer,
  IconStar,
  IconTerminal2,
} from '@tabler/icons-react'
import { useAppSidebar } from '../../hooks/useAppSidebar'
import type { Server, ServerStatus } from '../../types'
import classes from '../../styles/layout.module.css'

interface AppSidebarProps {
  onAddServer?: () => void
  onEditServer?: (server: Server) => void
}

export function AppSidebar({ onAddServer, onEditServer }: AppSidebarProps) {
  const { servers, activeServerId, loading, error, isEmpty, favorites, quickCommands, actions } =
    useAppSidebar()

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
          {loading && (
            <Center py="md">
              <Loader size="sm" />
            </Center>
          )}
          {!loading && error && (
            <Text px="sm" py="xs" size="xs" c="red">
              {error}
            </Text>
          )}
          {!loading && isEmpty && (
            <Text px="sm" py="xs" size="xs" c="dimmed">
              No servers yet. Add one to get started.
            </Text>
          )}
          {servers.map((server) => (
            <NavLink
              key={server.id}
              label={server.name}
              description={server.host}
              leftSection={<StatusDot status={server.status ?? 'disconnected'} />}
              active={server.id === activeServerId}
              rightSection={
                <Group gap={2} wrap="nowrap">
                  <ActionIcon
                    variant="transparent"
                    size="xs"
                    aria-label={`Edit ${server.name}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      onEditServer?.(server)
                    }}
                  >
                    <IconEdit size={13} />
                  </ActionIcon>
                  {server.isFavorite && (
                    <ActionIcon
                      variant="transparent"
                      size="xs"
                      aria-label="Toggle favorite"
                      onClick={(event) => {
                        event.stopPropagation()
                        actions.toggleFavorite(server.id)
                      }}
                    >
                      <IconStar
                        size={14}
                        color="var(--mantine-color-yellow-5)"
                        fill="var(--mantine-color-yellow-5)"
                      />
                    </ActionIcon>
                  )}
                </Group>
              }
              onClick={() => actions.setActiveServer(server.id)}
              onDoubleClick={() => void actions.connectToServer(server.id)}
            />
          ))}
        </div>

        <div className={classes.sidebarSection}>
          <Text px="sm" py={4} size="xs" fw={700} tt="uppercase" className={classes.sidebarSectionLabel}>
            Favorites
          </Text>
          {favorites.map((favorite) => (
            <NavLink
              key={favorite.id}
              label={favorite.label}
              leftSection={<IconFolder size={16} />}
              onClick={() => actions.navigateFavorite(favorite.path)}
            />
          ))}
        </div>

        <div className={classes.sidebarSection}>
          <Text px="sm" py={4} size="xs" fw={700} tt="uppercase" className={classes.sidebarSectionLabel}>
            Quick Commands
          </Text>
          {quickCommands.map((command) => (
            <NavLink
              key={command.id}
              label={command.label}
              leftSection={
                command.group === 'Nginx' ? <IconBolt size={16} /> : <IconTerminal2 size={16} />
              }
              onClick={() => actions.injectCommand(command.command)}
            />
          ))}
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

function StatusDot({ status }: { status: ServerStatus }) {
  const map: Record<ServerStatus, string> = {
    connected: 'var(--mantine-color-green-5)',
    connecting: 'var(--mantine-color-yellow-5)',
    disconnected: 'var(--mantine-color-gray-5)',
    error: 'var(--mantine-color-red-5)',
  }

  return (
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: map[status],
      }}
    />
  )
}
