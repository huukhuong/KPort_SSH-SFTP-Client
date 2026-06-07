import { useCallback, useEffect } from 'react'
import { syncExplorerListingsAfterTransfer } from '../services/transferExplorerSync'
import { subscribeTransferEvents } from '../services/transfer'
import { useTransferStore } from '../stores/transferStore'

export function useTransferEventSubscription() {
  const markStarted = useTransferStore((state) => state.markStarted)
  const updateProgress = useTransferStore((state) => state.updateProgress)
  const markCompleted = useTransferStore((state) => state.markCompleted)
  const markFailed = useTransferStore((state) => state.markFailed)
  const markCancelled = useTransferStore((state) => state.markCancelled)

  const handleComplete = useCallback(
    (id: string) => {
      syncExplorerListingsAfterTransfer(id)
      markCompleted(id)
    },
    [markCompleted],
  )

  useEffect(() => {
    return subscribeTransferEvents({
      onStarted: markStarted,
      onProgress: updateProgress,
      onComplete: handleComplete,
      onFailed: markFailed,
      onCancelled: markCancelled,
    })
  }, [handleComplete, markCancelled, markFailed, markStarted, updateProgress])
}
