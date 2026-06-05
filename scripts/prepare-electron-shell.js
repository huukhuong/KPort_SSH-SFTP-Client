#!/usr/bin/env node
/**
 * macOS dev only: clone Electron.app, patch Info.plist display name + icon.
 * Keep APP_* in sync with src/shared/app-brand.ts
 * Used with ELECTRON_OVERRIDE_DIST_PATH so Dock shows KPort instead of Electron.
 */

const APP_DISPLAY_NAME = 'KPort: SSH & SFTP Client'
const APP_BUNDLE_NAME = 'KPort'

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const ELECTRON_APP = join(ROOT, 'node_modules', 'electron', 'dist', 'Electron.app')
const SHELL_DIR = join(ROOT, '.electron')
const SHELL_APP = join(SHELL_DIR, 'Electron.app')
const VERSION_FILE = join(SHELL_DIR, '.electron-version')
const ICON_SOURCE = join(ROOT, 'resources', 'icon.icns')
const ICON_TARGET = join(SHELL_APP, 'Contents', 'Resources', 'electron.icns')

function getElectronVersion() {
  const pkg = JSON.parse(
    readFileSync(join(ROOT, 'node_modules', 'electron', 'package.json'), 'utf8'),
  )
  return pkg.version
}

function escapePlistString(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function patchInfoPlist(plistPath) {
  let content = readFileSync(plistPath, 'utf8')

  for (const [key, value] of [
    ['CFBundleDisplayName', escapePlistString(APP_DISPLAY_NAME)],
    ['CFBundleName', escapePlistString(APP_BUNDLE_NAME)],
  ]) {
    content = content.replace(
      new RegExp(`(<key>${key}</key>\\s*<string>)[^<]*(</string>)`),
      `$1${value}$2`,
    )
  }

  writeFileSync(plistPath, content)
}

function syncShellIcon() {
  if (!existsSync(SHELL_APP) || !existsSync(ICON_SOURCE)) {
    return
  }

  if (
    !existsSync(ICON_TARGET) ||
    statSync(ICON_SOURCE).mtimeMs > statSync(ICON_TARGET).mtimeMs
  ) {
    cpSync(ICON_SOURCE, ICON_TARGET)
    console.log('[prepare-electron-shell] Updated Dock icon')
  }
}

export function prepareElectronShell() {
  if (process.platform !== 'darwin') {
    return false
  }

  if (!existsSync(ELECTRON_APP)) {
    console.warn('[prepare-electron-shell] Electron.app not found — skip custom dev shell')
    return false
  }

  const version = getElectronVersion()
  const cachedVersion = existsSync(VERSION_FILE) ? readFileSync(VERSION_FILE, 'utf8').trim() : ''

  if (cachedVersion === version && existsSync(SHELL_APP)) {
    syncShellIcon()
    return true
  }

  console.log('[prepare-electron-shell] Building KPort dev app shell…')

  mkdirSync(SHELL_DIR, { recursive: true })
  if (existsSync(SHELL_APP)) {
    rmSync(SHELL_APP, { recursive: true })
  }

  cpSync(ELECTRON_APP, SHELL_APP, { recursive: true })
  patchInfoPlist(join(SHELL_APP, 'Contents', 'Info.plist'))

  if (existsSync(ICON_SOURCE)) {
    cpSync(ICON_SOURCE, ICON_TARGET)
  } else {
    console.warn('[prepare-electron-shell] resources/icon.icns missing — run: yarn generate:icons')
  }

  writeFileSync(VERSION_FILE, `${version}\n`)
  console.log(`[prepare-electron-shell] Ready: .electron/Electron.app (Dock: ${APP_DISPLAY_NAME})`)

  return true
}

const isDirectRun =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectRun) {
  prepareElectronShell()
}
