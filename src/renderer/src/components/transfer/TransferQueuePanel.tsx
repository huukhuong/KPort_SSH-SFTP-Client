import { Group, Progress, ScrollArea, Stack, Text } from '@mantine/core'
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react'
import { useEffect } from 'react'
import { useTransferStore } from '../../stores/transferStore'
import type { TransferJob } from '../../types'
import { getFileName } from '../../utils/fileTree'
import classes from '../../styles/layout.module.css'

export function TransferQueuePanel() {
  const transfers = useTransferStore((state) => state.transfers)
  const tickProgress = useTransferStore((state) => state.tickProgress)

  useEffect(() => {
    const timer = window.setInterval(() => tickProgress(), 700)
    return () => window.clearInterval(timer)
  }, [tickProgress])

  const uploading = transfers.filter((job) => job.direction === 'upload' && job.status === 'active')
  const downloading = transfers.filter((job) => job.direction === 'download' && job.status === 'active')
  const completed = transfers.filter((job) => job.status === 'completed')
  const failed = transfers.filter((job) => job.status === 'failed')

  return (
    <ScrollArea h="100%" type="auto" offsetScrollbars>
      <TransferSection title="Uploading" color="blue">
        {uploading.length === 0 ? (
          <Text size="xs" c="dimmed">
            No active uploads
          </Text>
        ) : (
          uploading.map((job) => <TransferItem key={job.id} job={job} />)
        )}
      </TransferSection>

      <TransferSection title="Downloading" color="dimmed">
        {downloading.length === 0 ? (
          <Text size="xs" c="dimmed">
            No active downloads
          </Text>
        ) : (
          downloading.map((job) => <TransferItem key={job.id} job={job} />)
        )}
      </TransferSection>

      <TransferSection title="Completed" color="green">
        {completed.map((job) => (
          <TransferItem key={job.id} job={job} />
        ))}
      </TransferSection>

      <TransferSection title="Failed" color="red">
        {failed.map((job) => (
          <TransferItem key={job.id} job={job} />
        ))}
      </TransferSection>
    </ScrollArea>
  )
}

function TransferSection({
  title,
  color,
  children,
}: {
  title: string
  color: string
  children: React.ReactNode
}) {
  return (
    <div className={classes.transferSection}>
      <Text size="xs" fw={600} c={color} mb="xs" tt="uppercase">
        {title}
      </Text>
      {children}
    </div>
  )
}

function TransferItem({ job }: { job: TransferJob }) {
  const path = job.direction === 'upload' ? job.remotePath : job.remotePath
  const name = getFileName(job.localPath)
  const color = job.status === 'failed' ? 'red' : job.status === 'completed' ? 'green' : 'blue'

  return (
    <Stack gap={4}>
      <Group gap="xs" wrap="nowrap">
        {job.direction === 'upload' ? (
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
          {job.progress}%
        </Text>
      </Group>
      <Progress value={job.progress} size="xs" color={color} animated={job.status === 'active'} />
      {job.error && (
        <Text size="xs" c="red">
          {job.error}
        </Text>
      )}
    </Stack>
  )
}
