import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/ipc-channels'
import type { KPortApi } from '../shared/kport-api'
import type { ServerFormInput } from '../shared/server'

const api: KPortApi = {
  ping: () => Promise.resolve('pong'),
  servers: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.SERVERS_LIST),
    create: (input: ServerFormInput) => ipcRenderer.invoke(IPC_CHANNELS.SERVERS_CREATE, input),
    update: (id: string, input: ServerFormInput) =>
      ipcRenderer.invoke(IPC_CHANNELS.SERVERS_UPDATE, id, input),
    delete: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.SERVERS_DELETE, id),
    toggleFavorite: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.SERVERS_TOGGLE_FAVORITE, id),
  },
  ssh: {
    connect: (serverId: string) => ipcRenderer.invoke(IPC_CHANNELS.SSH_CONNECT, serverId),
    disconnect: (serverId: string) => ipcRenderer.invoke(IPC_CHANNELS.SSH_DISCONNECT, serverId),
    test: (input: ServerFormInput) => ipcRenderer.invoke(IPC_CHANNELS.SSH_TEST, input),
    getStatus: (serverId: string) => ipcRenderer.invoke(IPC_CHANNELS.SSH_GET_STATUS, serverId),
    getMetrics: (serverId: string) => ipcRenderer.invoke(IPC_CHANNELS.SSH_GET_METRICS, serverId),
  },
  sftp: {
    list: (serverId: string, path: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.SFTP_LIST, serverId, path),
  },
  fs: {
    getPaths: () => ipcRenderer.invoke(IPC_CHANNELS.FS_GET_PATHS),
    list: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.FS_LIST, path),
  },
}

try {
  contextBridge.exposeInMainWorld('kport', api)
} catch (error) {
  console.error('[KPort] Failed to expose preload API:', error)
}
