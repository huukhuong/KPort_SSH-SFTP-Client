import { useMemo } from 'react'
import { useTransferStore } from '../stores/transferStore'

export function useTransferQueue() {
  const transfers = useTransferStore((state) => state.transfers)

  const uploading = useMemo(
    () =>
      transfers.filter(
        (job) =>
          job.direction === 'upload' &&
          (job.status === 'active' || job.status === 'queued'),
      ),
    [transfers],
  )
  const downloading = useMemo(
    () =>
      transfers.filter(
        (job) =>
          job.direction === 'download' &&
          (job.status === 'active' || job.status === 'queued'),
      ),
    [transfers],
  )
  const completed = useMemo(
    () => transfers.filter((job) => job.status === 'completed'),
    [transfers],
  )
  const failed = useMemo(
    () => transfers.filter((job) => job.status === 'failed'),
    [transfers],
  )

  return {
    uploading,
    downloading,
    completed,
    failed,
  }
}
