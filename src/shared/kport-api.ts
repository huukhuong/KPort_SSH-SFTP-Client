export interface KPortApi {
  ping: () => Promise<string>
}

declare global {
  interface Window {
    kport: KPortApi
  }
}

export {}
