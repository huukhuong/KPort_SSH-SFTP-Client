import { create } from 'zustand'
import { mockServers } from '../mocks/servers'
import type { AuthType, Server, ServerStatus } from '../types'

export interface ServerFormValues {
  name: string
  host: string
  port: number
  username: string
  authType: AuthType
  password?: string
  privateKey?: string
}

interface ServerStore {
  servers: Server[]
  activeServerId: string | null
  setActiveServer: (id: string) => void
  connectServer: (id: string) => Promise<void>
  disconnectServer: (id: string) => void
  toggleFavorite: (id: string) => void
  addServer: (values: ServerFormValues) => void
  updateServer: (id: string, values: ServerFormValues) => void
  testConnection: (values: ServerFormValues) => Promise<boolean>
}

let nextServerId = 100

function createServerFromForm(values: ServerFormValues): Server {
  return {
    id: String(nextServerId++),
    name: values.name.trim(),
    host: values.host.trim(),
    port: values.port,
    username: values.username.trim(),
    authType: values.authType,
    isFavorite: false,
    status: 'disconnected',
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const useServerStore = create<ServerStore>((set, get) => ({
  servers: mockServers,
  activeServerId: mockServers[0]?.id ?? null,

  setActiveServer: (id) => {
    set({ activeServerId: id })
    const server = get().servers.find((item) => item.id === id)
    if (server?.status === 'disconnected') {
      void get().connectServer(id)
    }
  },

  connectServer: async (id) => {
    set((state) => ({
      servers: state.servers.map((server) =>
        server.id === id ? { ...server, status: 'connecting' as ServerStatus } : server,
      ),
    }))

    await delay(1200)

    set((state) => ({
      servers: state.servers.map((server) =>
        server.id === id ? { ...server, status: 'connected' as ServerStatus } : server,
      ),
    }))
  },

  disconnectServer: (id) => {
    set((state) => ({
      servers: state.servers.map((server) =>
        server.id === id ? { ...server, status: 'disconnected' as ServerStatus } : server,
      ),
    }))
  },

  toggleFavorite: (id) => {
    set((state) => ({
      servers: state.servers.map((server) =>
        server.id === id ? { ...server, isFavorite: !server.isFavorite } : server,
      ),
    }))
  },

  addServer: (values) => {
    const server = createServerFromForm(values)
    set((state) => ({
      servers: [...state.servers, server],
      activeServerId: server.id,
    }))
    void get().connectServer(server.id)
  },

  updateServer: (id, values) => {
    set((state) => ({
      servers: state.servers.map((server) =>
        server.id === id
          ? {
              ...server,
              name: values.name.trim(),
              host: values.host.trim(),
              port: values.port,
              username: values.username.trim(),
              authType: values.authType,
            }
          : server,
      ),
    }))
  },

  testConnection: async (values) => {
    await delay(900)
    return Boolean(values.host.trim() && values.username.trim())
  },
}))
