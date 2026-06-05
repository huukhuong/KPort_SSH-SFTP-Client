import { cpSync, existsSync } from 'fs'
import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

function copyResourcesPlugin() {
  const copy = () => {
    const source = resolve('resources')
    const target = resolve('out/resources')

    if (!existsSync(source)) return

    cpSync(source, target, { recursive: true })
  }

  return {
    name: 'copy-resources',
    buildStart() {
      copy()
    },
    closeBundle() {
      copy()
    },
  }
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), copyResourcesPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
      },
    },
    plugins: [react()],
  },
})
