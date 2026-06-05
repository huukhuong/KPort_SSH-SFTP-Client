import { useCallback, useEffect, useMemo } from 'react'
import { getEditorTabLabel, useEditorStore } from '../stores/editorStore'
import { useEditorActions } from './useEditorActions'

export function useEditorPanel() {
  const tabs = useEditorStore((state) => state.tabs)
  const activeTabId = useEditorStore((state) => state.activeTabId)
  const setActiveTab = useEditorStore((state) => state.setActiveTab)
  const updateContent = useEditorStore((state) => state.updateContent)
  const { saveTab, closeTab } = useEditorActions()

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) ?? null,
    [tabs, activeTabId],
  )

  const saveActiveTab = useCallback(async () => {
    if (!activeTabId) return
    await saveTab(activeTabId)
  }, [activeTabId, saveTab])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        void saveActiveTab()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [saveActiveTab])

  return {
    tabs,
    hasTabs: tabs.length > 0,
    activeTab,
    getTabLabel: getEditorTabLabel,
    actions: {
      setActiveTab,
      closeTab,
      updateContent,
      saveTab,
      saveActiveTab,
    },
  }
}
