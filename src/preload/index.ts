import { contextBridge } from 'electron'

const api = {
  ping: () => Promise.resolve('pong'),
}

try {
  contextBridge.exposeInMainWorld('kport', api)
} catch (error) {
  console.error('[KPort] Failed to expose preload API:', error)
}
