import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  createDefaultSession,
  createEmptySession,
  createSessionWithCd,
  type TerminalSession,
} from '../hooks/useTerminalSession'

export interface TerminalTab {
  id: string
  title: string
  cwd: string
}

interface TerminalContextValue {
  tabs: TerminalTab[]
  activeTabId: string
  sessions: Record<string, TerminalSession>
  setActiveTabId: (id: string) => void
  addTab: () => void
  removeTab: (tabId: string) => void
  updateSession: (tabId: string, updater: (session: TerminalSession) => TerminalSession) => void
  openTerminalHere: (path: string) => void
  injectCommand: (command: string) => void
}

const TerminalContext = createContext<TerminalContextValue | null>(null)

const DEFAULT_CWD = '/var/www/api'

const FIRST_TAB: TerminalTab = {
  id: '1',
  title: `bash — ${DEFAULT_CWD}`,
  cwd: DEFAULT_CWD,
}

let nextTabId = 2

function createTab(index: number, cwd = DEFAULT_CWD): TerminalTab {
  const id = String(nextTabId++)
  return {
    id,
    title: index === 1 ? `bash — ${cwd}` : `bash ${index} — ${cwd}`,
    cwd,
  }
}

export function TerminalProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<TerminalTab[]>([FIRST_TAB])
  const [sessions, setSessions] = useState<Record<string, TerminalSession>>({
    [FIRST_TAB.id]: createDefaultSession(DEFAULT_CWD),
  })
  const [activeTabId, setActiveTabId] = useState(FIRST_TAB.id)

  const updateSession = useCallback(
    (tabId: string, updater: (session: TerminalSession) => TerminalSession) => {
      setSessions((current) => ({
        ...current,
        [tabId]: updater(current[tabId]),
      }))
    },
    [],
  )

  const addTab = useCallback(() => {
    const tab = createTab(tabs.length + 1)

    setTabs((current) => [...current, tab])
    setSessions((current) => ({
      ...current,
      [tab.id]: createEmptySession(DEFAULT_CWD),
    }))
    setActiveTabId(tab.id)
  }, [tabs.length])

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

    setSessions((current) => {
      if (!(tabId in current)) return current
      const { [tabId]: _removed, ...rest } = current
      return rest
    })
  }, [])

  const openTerminalHere = useCallback((path: string) => {
    setTabs((current) => {
      const tab: TerminalTab = {
        id: String(nextTabId++),
        title: `bash — ${path}`,
        cwd: path,
      }

      setSessions((sessions) => ({
        ...sessions,
        [tab.id]: createSessionWithCd(path),
      }))
      setActiveTabId(tab.id)

      return [...current, tab]
    })
  }, [])

  const injectCommand = useCallback(
    (command: string) => {
      const tabId = activeTabId
      const trimmed = command.trim()
      if (!trimmed) return

      setSessions((current) => {
        const active = current[tabId]
        if (!active) return current

        return {
          ...current,
          [tabId]: {
            ...active,
            history: [
              ...active.history,
              { type: 'command', text: trimmed },
              ...runInjectedCommand(trimmed),
            ],
            inputState: { value: '', cursor: 0 },
          },
        }
      })
    },
    [activeTabId],
  )

  const value = useMemo(
    () => ({
      tabs,
      activeTabId,
      sessions,
      setActiveTabId,
      addTab,
      removeTab,
      updateSession,
      openTerminalHere,
      injectCommand,
    }),
    [
      tabs,
      activeTabId,
      sessions,
      addTab,
      removeTab,
      updateSession,
      openTerminalHere,
      injectCommand,
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

function runInjectedCommand(command: string) {
  const cmd = command.trim()

  switch (cmd) {
    case 'docker ps':
      return [
        { type: 'output-header' as const, text: 'CONTAINER ID   IMAGE          STATUS' },
        { type: 'output' as const, text: 'a1b2c3d4e5f6   api:latest     Up 2 hours' },
      ]
    case 'pm2 status':
      return [
        { type: 'output-header' as const, text: 'id  name   status' },
        { type: 'output' as const, text: '0   api    online' },
      ]
    case 'nginx -t':
      return [{ type: 'output' as const, text: 'nginx: configuration file test is successful' }]
    default:
      if (cmd.startsWith('docker logs')) {
        return [
          { type: 'output' as const, text: 'Listening on :3000' },
          { type: 'output' as const, text: 'Health check OK' },
        ]
      }
      return [{ type: 'output' as const, text: `(mock) ${cmd}` }]
  }
}
