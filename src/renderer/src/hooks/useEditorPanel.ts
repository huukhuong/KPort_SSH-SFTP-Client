import { useMemo } from 'react'
import { getEditorTabLabel, useEditorStore } from '../stores/editorStore'

export function useEditorPanel() {
  const tabs = useEditorStore((state) => state.tabs)
  const activeTabId = useEditorStore((state) => state.activeTabId)
  const setActiveTab = useEditorStore((state) => state.setActiveTab)
  const closeTab = useEditorStore((state) => state.closeTab)
  const updateContent = useEditorStore((state) => state.updateContent)

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) ?? null,
    [tabs, activeTabId],
  )

  return {
    tabs,
    hasTabs: tabs.length > 0,
    activeTab,
    getTabLabel: getEditorTabLabel,
    actions: {
      setActiveTab,
      closeTab,
      updateContent,
    },
  }
}
