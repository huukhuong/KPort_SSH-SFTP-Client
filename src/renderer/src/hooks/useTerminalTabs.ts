import { useCallback, useState } from 'react'
import {
  createDefaultSession,
  createEmptySession,
  type TerminalSession,
} from './useTerminalSession'

export interface TerminalTab {
  id: string
  title: string
}

const FIRST_TAB: TerminalTab = { id: '1', title: 'bash — /var/www/api' }

let nextTabId = 2

function createTab(index: number): TerminalTab {
  const id = String(nextTabId++)
  const title = `bash ${index} — /var/www/api`

  return { id, title }
}

export function useTerminalTabs() {
  const [tabs, setTabs] = useState<TerminalTab[]>([FIRST_TAB])
  const [sessions, setSessions] = useState<Record<string, TerminalSession>>({
    [FIRST_TAB.id]: createDefaultSession(),
  })
  const [activeTabId, setActiveTabId] = useState(FIRST_TAB.id)

  const addTab = useCallback(() => {
    const tab = createTab(tabs.length + 1)

    setTabs((current) => [...current, tab])
    setSessions((current) => ({
      ...current,
      [tab.id]: createEmptySession(),
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

  const updateSession = useCallback(
    (tabId: string, updater: (session: TerminalSession) => TerminalSession) => {
      setSessions((current) => ({
        ...current,
        [tabId]: updater(current[tabId]),
      }))
    },
    [],
  )

  return {
    tabs,
    activeTabId,
    setActiveTabId,
    sessions,
    updateSession,
    addTab,
    removeTab,
  }
}
