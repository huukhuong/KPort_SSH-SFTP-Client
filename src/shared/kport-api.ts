import type { LocalFileEntry, LocalPathsInfo } from './fs'
import type { ServerMetrics } from './metrics'
import type { RemoteFileEntry } from './sftp'
import type { ServerFormInput, ServerRecord } from './server'
import type { ConnectionStatus, SshConnectResult, SshTestInput, SshTestResult } from './ssh'
import type {
  TerminalCreateInput,
  TerminalCreateResult,
  TerminalDataEvent,
  TerminalExitEvent,
  TerminalResizeInput,
} from './terminal'
import type {
  TransferDirection,
  TransferFailedEvent,
  TransferJobInput,
  TransferProgressEvent,
  TransferStateEvent,
} from './transfer'

export interface ServersApi {
  list: () => Promise<ServerRecord[]>
  create: (input: ServerFormInput) => Promise<ServerRecord>
  update: (id: string, input: ServerFormInput) => Promise<ServerRecord>
  delete: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<ServerRecord>
}

export interface SshApi {
  connect: (serverId: string) => Promise<SshConnectResult>
  disconnect: (serverId: string) => Promise<void>
  test: (input: SshTestInput) => Promise<SshTestResult>
  getStatus: (serverId: string) => Promise<ConnectionStatus>
  getMetrics: (serverId: string) => Promise<ServerMetrics>
}

export interface SftpApi {
  list: (serverId: string, path: string) => Promise<RemoteFileEntry[]>
  readFile: (serverId: string, path: string) => Promise<string>
  writeFile: (serverId: string, path: string, content: string) => Promise<void>
  mkdir: (serverId: string, parentPath: string, name: string) => Promise<string>
  createFile: (serverId: string, parentPath: string, name: string) => Promise<string>
  rename: (serverId: string, fromPath: string, toPath: string) => Promise<void>
  delete: (serverId: string, path: string, type: 'file' | 'directory') => Promise<void>
}

export interface FsApi {
  getPaths: () => Promise<LocalPathsInfo>
  list: (path: string) => Promise<LocalFileEntry[]>
  readFile: (path: string) => Promise<string>
  writeFile: (path: string, content: string) => Promise<void>
  mkdir: (parentPath: string, name: string) => Promise<string>
  createFile: (parentPath: string, name: string) => Promise<string>
  rename: (fromPath: string, toPath: string) => Promise<void>
  delete: (path: string, type: 'file' | 'directory') => Promise<void>
}

export interface TerminalApi {
  create: (input: TerminalCreateInput) => Promise<TerminalCreateResult>
  write: (terminalId: string, data: string) => Promise<void>
  resize: (input: TerminalResizeInput) => Promise<void>
  destroy: (terminalId: string) => Promise<void>
  onData: (callback: (event: TerminalDataEvent) => void) => () => void
  onExit: (callback: (event: TerminalExitEvent) => void) => () => void
}

export interface TransferApi {
  upload: (input: TransferJobInput) => Promise<{ accepted: boolean }>
  download: (input: TransferJobInput) => Promise<{ accepted: boolean }>
  cancel: (id: string) => Promise<{ accepted: boolean }>
  retry: (input: TransferJobInput, direction: TransferDirection) => Promise<{ accepted: boolean }>
  onStarted: (callback: (event: TransferStateEvent) => void) => () => void
  onProgress: (callback: (event: TransferProgressEvent) => void) => () => void
  onComplete: (callback: (event: TransferStateEvent) => void) => () => void
  onFailed: (callback: (event: TransferFailedEvent) => void) => () => void
  onCancelled: (callback: (event: TransferStateEvent) => void) => () => void
}

export interface DialogApi {
  openFile: () => Promise<string | null>
  openDirectory: () => Promise<string | null>
}

export interface FilesApi {
  getPathForFile: (file: File) => string
}

export interface KPortApi {
  ping: () => Promise<string>
  servers: ServersApi
  ssh: SshApi
  sftp: SftpApi
  fs: FsApi
  terminal: TerminalApi
  transfer: TransferApi
  dialog: DialogApi
  files: FilesApi
}

declare global {
  interface Window {
    kport: KPortApi
  }
}

export {}
