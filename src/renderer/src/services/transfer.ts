import type {
  TransferDirection,
  TransferFailedEvent,
  TransferJobInput,
  TransferProgressEvent,
  TransferStateEvent,
} from '../../../shared/transfer'

function getTransferApi() {
  if (!window.kport?.transfer) {
    throw new Error('KPort transfer API is not available')
  }

  return window.kport.transfer
}

export function createTransferId(): string {
  return crypto.randomUUID()
}

export async function startUpload(input: TransferJobInput): Promise<void> {
  await getTransferApi().upload(input)
}

export async function startDownload(input: TransferJobInput): Promise<void> {
  await getTransferApi().download(input)
}

export async function cancelTransfer(id: string): Promise<void> {
  await getTransferApi().cancel(id)
}

export async function retryTransfer(
  input: TransferJobInput,
  direction: TransferDirection,
): Promise<void> {
  await getTransferApi().retry(input, direction)
}

export function subscribeTransferEvents(handlers: {
  onStarted: (id: string) => void
  onProgress: (id: string, progress: number) => void
  onComplete: (id: string) => void
  onFailed: (id: string, error: string) => void
  onCancelled: (id: string) => void
}): () => void {
  if (!window.kport?.transfer) {
    return () => {}
  }

  const api = getTransferApi()

  const unsubStarted = api.onStarted((event: TransferStateEvent) => handlers.onStarted(event.id))
  const unsubProgress = api.onProgress((event: TransferProgressEvent) =>
    handlers.onProgress(event.id, event.progress),
  )
  const unsubComplete = api.onComplete((event: TransferStateEvent) => handlers.onComplete(event.id))
  const unsubFailed = api.onFailed((event: TransferFailedEvent) =>
    handlers.onFailed(event.id, event.error),
  )
  const unsubCancelled = api.onCancelled((event: TransferStateEvent) =>
    handlers.onCancelled(event.id),
  )

  return () => {
    unsubStarted()
    unsubProgress()
    unsubComplete()
    unsubFailed()
    unsubCancelled()
  }
}

export { pickLocalFile } from './dialog'
