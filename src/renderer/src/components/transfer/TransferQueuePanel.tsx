import { Group, Progress, ScrollArea, Stack, Text } from '@mantine/core'
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react'
import classes from '../../styles/layout.module.css'

export function TransferQueuePanel() {
  return (
    <ScrollArea h="100%" type="auto" offsetScrollbars>
      <div className={classes.transferSection}>
        <Text size="xs" fw={600} c="blue" mb="xs" tt="uppercase">
          Uploading
        </Text>
        <TransferItem
          direction="upload"
          name="deploy.zip"
          path="/var/www/api/deploy.zip"
          progress={62}
          status="active"
        />
      </div>

      <div className={classes.transferSection}>
        <Text size="xs" fw={600} c="dimmed" mb="xs" tt="uppercase">
          Downloading
        </Text>
        <Text size="xs" c="dimmed">
          No active downloads
        </Text>
      </div>

      <div className={classes.transferSection}>
        <Text size="xs" fw={600} c="green" mb="xs" tt="uppercase">
          Completed
        </Text>
        <TransferItem
          direction="download"
          name="app.log"
          path="/var/log/app.log"
          progress={100}
          status="completed"
        />
      </div>

      <div className={classes.transferSection}>
        <Text size="xs" fw={600} c="red" mb="xs" tt="uppercase">
          Failed
        </Text>
        <TransferItem
          direction="upload"
          name="config.yml"
          path="/etc/app/config.yml"
          progress={18}
          status="failed"
          error="Permission denied"
        />
      </div>
    </ScrollArea>
  )
}

function TransferItem({
  direction,
  name,
  path,
  progress,
  status,
  error,
}: {
  direction: 'upload' | 'download'
  name: string
  path: string
  progress: number
  status: 'active' | 'completed' | 'failed'
  error?: string
}) {
  const color = status === 'failed' ? 'red' : status === 'completed' ? 'green' : 'blue'

  return (
    <Stack gap={4}>
      <Group gap="xs" wrap="nowrap">
        {direction === 'upload' ? (
          <IconArrowUp size={14} color="var(--mantine-color-blue-5)" />
        ) : (
          <IconArrowDown size={14} color="var(--mantine-color-teal-5)" />
        )}
        <div style={{ minWidth: 0 }}>
          <Text size="sm" fw={500} truncate>
            {name}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {path}
          </Text>
        </div>
        <Text size="xs" c="dimmed" ml="auto">
          {progress}%
        </Text>
      </Group>
      <Progress value={progress} size="xs" color={color} />
      {error && (
        <Text size="xs" c="red">
          {error}
        </Text>
      )}
    </Stack>
  )
}
