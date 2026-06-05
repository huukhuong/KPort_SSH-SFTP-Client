import { app, BrowserWindow, screen } from 'electron'
import { existsSync } from 'fs'
import { join } from 'path'
import { closeDatabase, getDatabase } from './db/index'
import { registerIpcHandlers } from './ipc/register'

function resolvePreloadPath(): string {
  const candidates = [
    join(__dirname, '../preload/index.mjs'),
    join(__dirname, '../preload/index.js'),
  ]

  const resolved = candidates.find((path) => existsSync(path))
  if (!resolved) {
    console.error('[KPort] Preload script not found:', candidates)
  }

  return resolved ?? candidates[0]
}

function createWindow(): void {
  const isDev = Boolean(process.env.ELECTRON_RENDERER_URL)
  const preloadPath = resolvePreloadPath()
  const { workArea } = screen.getPrimaryDisplay()

  const mainWindow = new BrowserWindow({
    x: workArea.x,
    y: workArea.y,
    width: workArea.width,
    height: workArea.height,
    minWidth: 960,
    minHeight: 640,
    show: false,
    title: 'KPort',
    backgroundColor: '#1a1b1e',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('[KPort] Renderer failed to load:', errorCode, errorDescription)
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.maximize()
    mainWindow.show()
  })

  if (isDev) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL!)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  getDatabase()
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  closeDatabase()
})
