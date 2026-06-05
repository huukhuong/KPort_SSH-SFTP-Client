import { useEffect } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { getLocalPaths } from './services/fs'
import { useExplorerStore } from './stores/explorerStore'
import { useServerStore } from './stores/serverStore'

export default function App() {
  const initializeServers = useServerStore((state) => state.initialize)
  const initializeLocalPaths = useExplorerStore((state) => state.initializeLocalPaths)

  useEffect(() => {
    void initializeServers()
    void getLocalPaths()
      .then((paths) => initializeLocalPaths(paths.homePath, paths.rootPath))
      .catch((error) => {
        console.error('[KPort] Failed to resolve local paths:', error)
      })
  }, [initializeServers, initializeLocalPaths])

  return <AppLayout />
}
