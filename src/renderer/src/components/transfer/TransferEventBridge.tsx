import { useTransferEventSubscription } from '../../hooks/useTransferEventSubscription'

/** Subscribes to main-process transfer events once for the whole app. */
export function TransferEventBridge() {
  useTransferEventSubscription()
  return null
}
