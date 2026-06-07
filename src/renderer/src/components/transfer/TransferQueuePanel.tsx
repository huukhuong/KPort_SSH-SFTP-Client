import { Button, Group, Progress, Stack, Text } from '@mantine/core'
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react'
import { useTransferQueue } from '../../hooks/useTransferQueue'
import { useTransferActions } from '../../hooks/useTransferActions'
import type { TransferJob } from '../../types'
import { getFileName } from '../../utils/fileTree'
import classes from '../../styles/layout.module.css'

export function TransferQueuePanel() {
  const { uploading, downloading, completed, failed } = useTransferQueue()
  const { cancelJob, retryJob } = useTransferActions()

  return (
    <div className={classes.transferPanelScroll}>
      <TransferSection title="Uploading" color="blue">
        {uploading.length === 0 ? (
          <Text size="xs" c="dimmed">
            No active uploads
          </Text>
        ) : (
          uploading.map((job) => (
            <TransferItem key={job.id} job={job} onCancel={cancelJob} onRetry={retryJob} />
          ))
        )}
      </TransferSection>

      <TransferSection title="Downloading" color="dimmed">
        {downloading.length === 0 ? (
          <Text size="xs" c="dimmed">
            No active downloads
          </Text>
        ) : (
          downloading.map((job) => (
            <TransferItem key={job.id} job={job} onCancel={cancelJob} onRetry={retryJob} />
          ))
        )}
      </TransferSection>

      <TransferSection title="Completed" color="green">
        {completed.length === 0 ? (
          <Text size="xs" c="dimmed">
            No completed transfers
          </Text>
        ) : (
          completed.map((job) => (
            <TransferItem key={job.id} job={job} onCancel={cancelJob} onRetry={retryJob} />
          ))
        )}
      </TransferSection>

      <TransferSection title="Failed" color="red">
        {failed.length === 0 ? (
          <Text size="xs" c="dimmed">
            No failed transfers
          </Text>
        ) : (
          failed.map((job) => (
            <TransferItem key={job.id} job={job} onCancel={cancelJob} onRetry={retryJob} />
          ))
        )}
      </TransferSection>
    </div>
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

function TransferItem({
  job,
  onCancel,
  onRetry,
}: {
  job: TransferJob
  onCancel: (id: string) => void
  onRetry: (job: TransferJob) => void
}) {
  const name = getFileName(job.localPath)
  const color = job.status === 'failed' ? 'red' : job.status === 'completed' ? 'green' : 'blue'
  const statusLabel =
    job.status === 'queued' ? 'Queued' : job.status === 'active' ? `${job.progress}%` : job.status

  return (
    <Stack gap={4} mb="sm">
      <Group gap="xs" wrap="nowrap" align="flex-start">
        {job.direction === 'upload' ? (
          <IconArrowUp size={14} color="var(--mantine-color-blue-5)" />
        ) : (
          <IconArrowDown size={14} color="var(--mantine-color-teal-5)" />
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <Text size="sm" fw={500} truncate>
            {name}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {job.direction === 'upload' ? `→ ${job.remotePath}` : `← ${job.remotePath}`}
          </Text>
        </div>
        <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
          {statusLabel}
        </Text>
      </Group>
      {(job.status === 'active' || job.status === 'queued') && (
        <Progress
          value={job.status === 'queued' ? 0 : job.progress}
          size="xs"
          color={color}
          animated={job.status === 'active'}
        />
      )}
      {job.error && (
        <Text size="xs" c="red">
          {job.error}
        </Text>
      )}
      <Group gap="xs">
        {(job.status === 'active' || job.status === 'queued') && (
          <Button size="xs" variant="light" color="gray" onClick={() => onCancel(job.id)}>
            Cancel
          </Button>
        )}
        {job.status === 'failed' && (
          <Button size="xs" variant="light" onClick={() => onRetry(job)}>
            Retry
          </Button>
        )}
      </Group>
    </Stack>
  )
}
