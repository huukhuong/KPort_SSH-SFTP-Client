import { create } from 'zustand'
import type { TransferJob, TransferStatus } from '../types'

interface TransferStore {
  transfers: TransferJob[]
  enqueue: (job: TransferJob) => void
  markStarted: (id: string) => void
  updateProgress: (id: string, progress: number) => void
  markCompleted: (id: string) => void
  markFailed: (id: string, error: string) => void
  markCancelled: (id: string) => void
  remove: (id: string) => void
}

function updateJob(
  transfers: TransferJob[],
  id: string,
  patch: Partial<TransferJob>,
): TransferJob[] {
  return transfers.map((job) => (job.id === id ? { ...job, ...patch } : job))
}

export const useTransferStore = create<TransferStore>((set) => ({
  transfers: [],

  enqueue: (job) =>
    set((state) => ({
      transfers: [job, ...state.transfers],
    })),

  markStarted: (id) =>
    set((state) => ({
      transfers: updateJob(state.transfers, id, { status: 'active', progress: 0, error: undefined }),
    })),

  updateProgress: (id, progress) =>
    set((state) => ({
      transfers: updateJob(state.transfers, id, { progress }),
    })),

  markCompleted: (id) =>
    set((state) => ({
      transfers: updateJob(state.transfers, id, { status: 'completed', progress: 100, error: undefined }),
    })),

  markFailed: (id, error) =>
    set((state) => ({
      transfers: updateJob(state.transfers, id, { status: 'failed', error }),
    })),

  markCancelled: (id) =>
    set((state) => ({
      transfers: updateJob(state.transfers, id, { status: 'cancelled' }),
    })),

  remove: (id) =>
    set((state) => ({
      transfers: state.transfers.filter((job) => job.id !== id),
    })),
}))

export function isActiveTransferStatus(status: TransferStatus): boolean {
  return status === 'queued' || status === 'active'
}
