import { notifications } from '@mantine/notifications'
import { create } from 'zustand'
import type { QuickCommandInput, QuickCommandRecord } from '../../../shared/productivity'
import {
  createQuickCommand,
  deleteQuickCommand,
  listQuickCommands,
  updateQuickCommand,
} from '../services/quickCommands'

interface QuickCommandsStore {
  commands: QuickCommandRecord[]
  loading: boolean
  load: () => Promise<void>
  add: (input: QuickCommandInput) => Promise<void>
  update: (id: string, input: QuickCommandInput) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useQuickCommandsStore = create<QuickCommandsStore>((set, get) => ({
  commands: [],
  loading: false,

  load: async () => {
    set({ loading: true })
    try {
      const items = await listQuickCommands()
      set({ commands: items })
    } catch (error) {
      notifications.show({
        title: 'Failed to load quick commands',
        message: error instanceof Error ? error.message : 'Unknown error',
        color: 'red',
      })
    } finally {
      set({ loading: false })
    }
  },

  add: async (input) => {
    try {
      await createQuickCommand(input)
      await get().load()
      notifications.show({
        title: 'Quick command added',
        message: input.label,
        color: 'green',
        autoClose: 2200,
      })
    } catch (error) {
      notifications.show({
        title: 'Could not add quick command',
        message: error instanceof Error ? error.message : 'Unknown error',
        color: 'red',
      })
      throw error
    }
  },

  update: async (id, input) => {
    try {
      await updateQuickCommand(id, input)
      await get().load()
      notifications.show({
        title: 'Quick command updated',
        message: input.label,
        color: 'green',
        autoClose: 2200,
      })
    } catch (error) {
      notifications.show({
        title: 'Could not update quick command',
        message: error instanceof Error ? error.message : 'Unknown error',
        color: 'red',
      })
      throw error
    }
  },

  remove: async (id) => {
    try {
      await deleteQuickCommand(id)
      await get().load()
    } catch (error) {
      notifications.show({
        title: 'Could not remove quick command',
        message: error instanceof Error ? error.message : 'Unknown error',
        color: 'red',
      })
    }
  },
}))
