import { create } from 'zustand'
import { mockServers } from '../mocks/servers'
import type { Server } from '../types'

interface ServerStore {
  servers: Server[]
  activeServerId: string | null
  setActiveServer: (id: string | null) => void
}

export const useServerStore = create<ServerStore>((set) => ({
  servers: mockServers,
  activeServerId: mockServers[0]?.id ?? null,
  setActiveServer: (id) => set({ activeServerId: id }),
}))
