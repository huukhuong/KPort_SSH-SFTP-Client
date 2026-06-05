import { AppShell, Badge, Group, Stack, Text, Title } from '@mantine/core'
import { IconServer } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

export default function App() {
  const [ipcStatus, setIpcStatus] = useState<string>('checking...')

  useEffect(() => {
    if (!window.kport) {
      setIpcStatus('unavailable')
      return
    }

    window.kport
      .ping()
      .then((response: string) => setIpcStatus(response))
      .catch(() => setIpcStatus('unavailable'))
  }, [])

  return (
    <AppShell header={{ height: 48 }} padding="md" style={{ height: '100vh' }}>
      <AppShell.Header px="md">
        <Group h="100%" justify="space-between">
          <Group gap="xs">
            <IconServer size={20} />
            <Title order={4}>KPort</Title>
          </Group>
          <Group gap="xs">
            <Badge variant="light" color="green">
              IPC: {ipcStatus}
            </Badge>
            <Badge variant="light">Phase 0 scaffold</Badge>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Stack gap="sm" maw={640}>
          <Title order={3}>Project structure ready</Title>
          <Text c="dimmed">
            Electron + React + Mantine scaffold is running. Next step: build the full UI demo shell
            with mock data under <code>src/renderer/src/mocks/</code>.
          </Text>
        </Stack>
      </AppShell.Main>
    </AppShell>
  )
}
