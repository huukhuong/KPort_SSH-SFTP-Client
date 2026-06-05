import type { ServerFormInput } from '../../../shared/server'
import { create } from 'zustand'
import { useExplorerStore } from './explorerStore'
import {
  createServer,
  listServers,
  toggleServerFavorite,
  updateServer,
} from '../services/servers'
import { connectServer, disconnectServer, testConnection as testSshConnection } from '../services/ssh'
import type { Server, ServerStatus } from '../types'

export type ServerFormValues = ServerFormInput

interface ServerStore {
  servers: Server[]
  activeServerId: string | null
  loading: boolean
  initialized: boolean
  error: string | null
  initialize: () => Promise<void>
  setActiveServer: (id: string) => void
  connectToServer: (id: string) => Promise<void>
  connectServer: (id: string) => Promise<void>
  disconnectServer: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  addServer: (values: ServerFormValues) => Promise<void>
  updateServer: (id: string, values: ServerFormValues) => Promise<void>
  testConnection: (values: ServerFormValues) => Promise<boolean>
}

function patchServerStatus(servers: Server[], id: string, status: ServerStatus): Server[] {
  return servers.map((server) => (server.id === id ? { ...server, status } : server))
}

export const useServerStore = create<ServerStore>((set, get) => ({
  servers: [],
  activeServerId: null,
  loading: false,
  initialized: false,
  error: null,

  initialize: async () => {
    if (get().initialized || get().loading) return

    set({ loading: true, error: null })

    try {
      const servers = await listServers()

      set({
        servers,
        activeServerId: null,
        loading: false,
        initialized: true,
        error: null,
      })
    } catch (error) {
      set({
        servers: [],
        activeServerId: null,
        loading: false,
        initialized: true,
        error: error instanceof Error ? error.message : 'Failed to load servers',
      })
    }
  },

  setActiveServer: (id) => {
    set({ activeServerId: id })
  },

  connectToServer: async (id) => {
    set({ activeServerId: id })
    await get().connectServer(id)
  },

  connectServer: async (id) => {
    const current = get().servers.find((server) => server.id === id)
    if (!current || current.status === 'connecting' || current.status === 'connected') {
      return
    }

    set((state) => ({
      servers: patchServerStatus(state.servers, id, 'connecting'),
    }))

    try {
      const result = await connectServer(id)
      set((state) => ({
        servers: patchServerStatus(state.servers, id, 'connected'),
      }))
      const explorer = useExplorerStore.getState()
      explorer.setRemoteHome(result.homePath)
      explorer.navigateRemote(result.homePath)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection failed'
      set((state) => ({
        servers: patchServerStatus(state.servers, id, 'error'),
      }))
      throw new Error(message)
    }
  },

  disconnectServer: async (id) => {
    await disconnectServer(id)
    set((state) => ({
      servers: patchServerStatus(state.servers, id, 'disconnected'),
    }))
  },

  toggleFavorite: async (id) => {
    const updated = await toggleServerFavorite(id)
    set((state) => ({
      servers: state.servers.map((server) =>
        server.id === id ? { ...updated, status: server.status } : server,
      ),
    }))
  },

  addServer: async (values) => {
    const server = await createServer(values)
    set((state) => ({
      servers: [...state.servers, server],
      activeServerId: server.id,
    }))
  },

  updateServer: async (id, values) => {
    const previousStatus = get().servers.find((server) => server.id === id)?.status
    const server = await updateServer(id, values)

    set((state) => ({
      servers: state.servers.map((item) =>
        item.id === id
          ? { ...server, status: previousStatus === 'connected' ? 'disconnected' : item.status }
          : item,
      ),
    }))

    if (previousStatus === 'connected') {
      await get().disconnectServer(id)
    }
  },

  testConnection: async (values) => {
    const result = await testSshConnection(values)
    if (!result.ok && result.error) {
      throw new Error(result.error)
    }
    return result.ok
  },
}))
