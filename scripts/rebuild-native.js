#!/usr/bin/env node

import { rebuild } from '@electron/rebuild'
import { createRequire } from 'module'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const require = createRequire(import.meta.url)

async function main() {
  const electronVersion = require('electron/package.json').version

  // Only better-sqlite3 must be rebuilt for Electron. ssh2's optional cpu-features
  // is a Node perf helper and fails on some CI images (Python 3.12+ / distutils).
  await rebuild({
    buildPath: ROOT,
    electronVersion,
    onlyModules: ['better-sqlite3'],
    types: ['prod'],
    force: true,
  })
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
