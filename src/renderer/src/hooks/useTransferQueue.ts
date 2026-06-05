import { useEffect, useMemo } from 'react'
import { useTransferStore } from '../stores/transferStore'

export function useTransferQueue() {
  const transfers = useTransferStore((state) => state.transfers)
  const tickProgress = useTransferStore((state) => state.tickProgress)

  useEffect(() => {
    const timer = window.setInterval(() => tickProgress(), 700)
    return () => window.clearInterval(timer)
  }, [tickProgress])

  const uploading = useMemo(
    () => transfers.filter((job) => job.direction === 'upload' && job.status === 'active'),
    [transfers],
  )
  const downloading = useMemo(
    () => transfers.filter((job) => job.direction === 'download' && job.status === 'active'),
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
