#!/usr/bin/env node

import { spawn } from 'child_process'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { generateAppIcons } from './generate-app-icon.js'
import { prepareElectronShell } from './prepare-electron-shell.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

async function main() {
  await generateAppIcons()

  const shellReady = prepareElectronShell()
  const env = { ...process.env }

  if (shellReady) {
    env.ELECTRON_OVERRIDE_DIST_PATH = resolve(ROOT, '.electron')
  }

  const child = spawn('electron-vite', ['dev'], {
    cwd: ROOT,
    stdio: 'inherit',
    env,
    shell: true,
  })

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal)
      return
    }
    process.exit(code ?? 0)
  })
}

main().catch((error) => {
  console.error('[dev] Failed to start:', error)
  process.exit(1)
})
