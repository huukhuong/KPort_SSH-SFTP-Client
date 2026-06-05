import { useTerminal } from '../providers/TerminalProvider'

export function useTerminalPanel() {
  const terminal = useTerminal()

  return {
    tabs: terminal.tabs,
    activeTabId: terminal.activeTabId,
    sessions: terminal.sessions,
    actions: {
      setActiveTabId: terminal.setActiveTabId,
      addTab: terminal.addTab,
      removeTab: terminal.removeTab,
      updateSession: terminal.updateSession,
    },
  }
}
