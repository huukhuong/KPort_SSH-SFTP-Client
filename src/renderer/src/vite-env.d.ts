/// <reference types="vite/client" />

import type { KPortApi } from '../../../shared/kport-api'

declare global {
  interface Window {
    kport: KPortApi
  }
}

export {}
