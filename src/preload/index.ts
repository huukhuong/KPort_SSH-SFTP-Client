import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/ipc-channels'
import type { KPortApi } from '../shared/kport-api'
import type { ServerFormInput } from '../shared/server'
import type {
  TerminalCreateInput,
  TerminalDataEvent,
  TerminalExitEvent,
  TerminalResizeInput,
} from '../shared/terminal'
import type {
  TransferDirection,
  TransferFailedEvent,
  TransferJobInput,
  TransferProgressEvent,
  TransferStateEvent,
} from '../shared/transfer'

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
    readFile: (serverId: string, path: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.SFTP_READ_FILE, serverId, path),
    writeFile: (serverId: string, path: string, content: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.SFTP_WRITE_FILE, serverId, path, content),
    mkdir: (serverId: string, parentPath: string, name: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.SFTP_MKDIR, serverId, parentPath, name),
    createFile: (serverId: string, parentPath: string, name: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.SFTP_CREATE_FILE, serverId, parentPath, name),
    rename: (serverId: string, fromPath: string, toPath: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.SFTP_RENAME, serverId, fromPath, toPath),
    delete: (serverId: string, path: string, type: 'file' | 'directory') =>
      ipcRenderer.invoke(IPC_CHANNELS.SFTP_DELETE, serverId, path, type),
  },
  fs: {
    getPaths: () => ipcRenderer.invoke(IPC_CHANNELS.FS_GET_PATHS),
    list: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.FS_LIST, path),
    readFile: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.FS_READ_FILE, path),
    writeFile: (path: string, content: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.FS_WRITE_FILE, path, content),
    mkdir: (parentPath: string, name: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.FS_MKDIR, parentPath, name),
    createFile: (parentPath: string, name: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.FS_CREATE_FILE, parentPath, name),
    rename: (fromPath: string, toPath: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.FS_RENAME, fromPath, toPath),
    delete: (path: string, type: 'file' | 'directory') =>
      ipcRenderer.invoke(IPC_CHANNELS.FS_DELETE, path, type),
  },
  terminal: {
    create: (input: TerminalCreateInput) =>
      ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_CREATE, input),
    write: (terminalId: string, data: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_WRITE, terminalId, data),
    resize: (input: TerminalResizeInput) =>
      ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_RESIZE, input),
    destroy: (terminalId: string) => ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_DESTROY, terminalId),
    onData: (callback: (event: TerminalDataEvent) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, payload: TerminalDataEvent) => {
        callback(payload)
      }
      ipcRenderer.on(IPC_CHANNELS.TERMINAL_DATA, listener)
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.TERMINAL_DATA, listener)
      }
    },
    onExit: (callback: (event: TerminalExitEvent) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, payload: TerminalExitEvent) => {
        callback(payload)
      }
      ipcRenderer.on(IPC_CHANNELS.TERMINAL_EXIT, listener)
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.TERMINAL_EXIT, listener)
      }
    },
  },
  transfer: {
    upload: (input: TransferJobInput) => ipcRenderer.invoke(IPC_CHANNELS.TRANSFER_UPLOAD, input),
    download: (input: TransferJobInput) =>
      ipcRenderer.invoke(IPC_CHANNELS.TRANSFER_DOWNLOAD, input),
    cancel: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.TRANSFER_CANCEL, id),
    retry: (input: TransferJobInput, direction: TransferDirection) =>
      ipcRenderer.invoke(IPC_CHANNELS.TRANSFER_RETRY, input, direction),
    onStarted: (callback: (event: TransferStateEvent) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, payload: TransferStateEvent) => {
        callback(payload)
      }
      ipcRenderer.on(IPC_CHANNELS.TRANSFER_STARTED, listener)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.TRANSFER_STARTED, listener)
    },
    onProgress: (callback: (event: TransferProgressEvent) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, payload: TransferProgressEvent) => {
        callback(payload)
      }
      ipcRenderer.on(IPC_CHANNELS.TRANSFER_PROGRESS, listener)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.TRANSFER_PROGRESS, listener)
    },
    onComplete: (callback: (event: TransferStateEvent) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, payload: TransferStateEvent) => {
        callback(payload)
      }
      ipcRenderer.on(IPC_CHANNELS.TRANSFER_COMPLETE, listener)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.TRANSFER_COMPLETE, listener)
    },
    onFailed: (callback: (event: TransferFailedEvent) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, payload: TransferFailedEvent) => {
        callback(payload)
      }
      ipcRenderer.on(IPC_CHANNELS.TRANSFER_FAILED, listener)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.TRANSFER_FAILED, listener)
    },
    onCancelled: (callback: (event: TransferStateEvent) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, payload: TransferStateEvent) => {
        callback(payload)
      }
      ipcRenderer.on(IPC_CHANNELS.TRANSFER_CANCELLED, listener)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.TRANSFER_CANCELLED, listener)
    },
  },
  dialog: {
    openFile: () => ipcRenderer.invoke(IPC_CHANNELS.DIALOG_OPEN_FILE),
    openDirectory: () => ipcRenderer.invoke(IPC_CHANNELS.DIALOG_OPEN_DIRECTORY),
  },
}

try {
  contextBridge.exposeInMainWorld('kport', api)
} catch (error) {
  console.error('[KPort] Failed to expose preload API:', error)
}
