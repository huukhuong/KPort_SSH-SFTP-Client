import { create } from 'zustand'
import { mockTransfers } from '../mocks/transfers'
import type { TransferJob } from '../types'

interface TransferStore {
  transfers: TransferJob[]
  tickProgress: () => void
}

export const useTransferStore = create<TransferStore>((set) => ({
  transfers: mockTransfers,

  tickProgress: () => {
    set((state) => ({
      transfers: state.transfers.map((job) => {
        if (job.status !== 'active' || job.progress >= 100) return job

        const nextProgress = Math.min(100, job.progress + 2)
        if (nextProgress >= 100) {
          return { ...job, progress: 100, status: 'completed' }
        }

        return { ...job, progress: nextProgress }
      }),
    }))
  },
}))
