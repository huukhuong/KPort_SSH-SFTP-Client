import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useServerStore } from '../stores/serverStore'
import { writeTerminal } from '../services/terminal'

export interface TerminalTab {
  id: string
  title: string
  serverId: string | null
  initialCwd?: string
}

interface TerminalContextValue {
  tabs: TerminalTab[]
  activeTabId: string
  isConnected: boolean
  activeServerId: string | null
  setActiveTabId: (id: string) => void
  addTab: () => void
  removeTab: (tabId: string) => void
  openTerminalHere: (path: string) => void
  injectCommand: (command: string) => void
  registerTerminalId: (tabId: string, terminalId: string) => void
  unregisterTerminalId: (tabId: string) => void
}

const TerminalContext = createContext<TerminalContextValue | null>(null)

let nextTabId = 2

function createTabTitle(index: number, label: string): string {
  return index === 1 ? `bash — ${label}` : `bash ${index} — ${label}`
}

function createTab(index: number, serverId: string | null, label: string, initialCwd?: string): TerminalTab {
  return {
    id: String(nextTabId++),
    title: createTabTitle(index, label),
    serverId,
    initialCwd,
  }
}

export function TerminalProvider({ children }: { children: ReactNode }) {
  const activeServerId = useServerStore((state) => state.activeServerId)
  const servers = useServerStore((state) => state.servers)
  const activeServer = servers.find((server) => server.id === activeServerId)
  const isConnected = activeServer?.status === 'connected'
  const serverLabel = activeServer ? activeServer.name : 'no server'

  const [tabs, setTabs] = useState<TerminalTab[]>([
    {
      id: '1',
      title: createTabTitle(1, serverLabel),
      serverId: activeServerId,
    },
  ])
  const [activeTabId, setActiveTabId] = useState('1')
  const terminalIdsRef = useRef<Record<string, string>>({})
  const prevActiveServerIdRef = useRef<string | null>(null)
  const wasConnectedRef = useRef(false)

  useEffect(() => {
    if (!activeServerId || !isConnected) {
      if (!isConnected) {
        terminalIdsRef.current = {}
        wasConnectedRef.current = false
      }
      return
    }

    const switchedServer = prevActiveServerIdRef.current !== activeServerId
    const reconnected = !wasConnectedRef.current

    prevActiveServerIdRef.current = activeServerId
    wasConnectedRef.current = true

    if (!switchedServer && !reconnected) return

    terminalIdsRef.current = {}
    setActiveTabId('1')
    setTabs([
      {
        id: '1',
        title: createTabTitle(1, serverLabel),
        serverId: activeServerId,
      },
    ])
  }, [activeServerId, isConnected, serverLabel])

  const registerTerminalId = useCallback((tabId: string, terminalId: string) => {
    terminalIdsRef.current[tabId] = terminalId
  }, [])

  const unregisterTerminalId = useCallback((tabId: string) => {
    delete terminalIdsRef.current[tabId]
  }, [])

  const addTab = useCallback(() => {
    const tab = createTab(tabs.length + 1, activeServerId, serverLabel)

    setTabs((current) => [...current, tab])
    setActiveTabId(tab.id)
  }, [activeServerId, serverLabel, tabs.length])

  const removeTab = useCallback((tabId: string) => {
    setTabs((current) => {
      if (current.length <= 1) return current

      const index = current.findIndex((tab) => tab.id === tabId)
      if (index === -1) return current

      const nextTabs = current.filter((tab) => tab.id !== tabId)

      setActiveTabId((activeId) => {
        if (activeId !== tabId) return activeId
        const nextIndex = Math.min(index, nextTabs.length - 1)
        return nextTabs[nextIndex]?.id ?? activeId
      })

      return nextTabs
    })

    unregisterTerminalId(tabId)
  }, [unregisterTerminalId])

  const openTerminalHere = useCallback(
    (path: string) => {
      if (!activeServerId) return

      const tab = createTab(tabs.length + 1, activeServerId, path, path)

      setTabs((current) => [...current, tab])
      setActiveTabId(tab.id)
    },
    [activeServerId, tabs.length],
  )

  const injectCommand = useCallback(
    (command: string) => {
      const trimmed = command.trim()
      if (!trimmed) return

      const terminalId = terminalIdsRef.current[activeTabId]
      if (!terminalId) return

      void writeTerminal(terminalId, `${trimmed}\n`)
    },
    [activeTabId],
  )

  const value = useMemo(
    () => ({
      tabs,
      activeTabId,
      isConnected,
      activeServerId,
      setActiveTabId,
      addTab,
      removeTab,
      openTerminalHere,
      injectCommand,
      registerTerminalId,
      unregisterTerminalId,
    }),
    [
      tabs,
      activeTabId,
      isConnected,
      activeServerId,
      addTab,
      removeTab,
      openTerminalHere,
      injectCommand,
      registerTerminalId,
      unregisterTerminalId,
    ],
  )

  return <TerminalContext.Provider value={value}>{children}</TerminalContext.Provider>
}

export function useTerminal() {
  const context = useContext(TerminalContext)
  if (!context) {
    throw new Error('useTerminal must be used within TerminalProvider')
  }
  return context
}
