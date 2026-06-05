import { notifications } from '@mantine/notifications'
import { useCallback } from 'react'
import { readEditorFile, writeEditorFile, type OpenEditorFileInput } from '../services/editor'
import { getEditorTabLabel, useEditorStore } from '../stores/editorStore'

export function useEditorActions() {
  const findTab = useEditorStore((state) => state.findTab)
  const addLoadingTab = useEditorStore((state) => state.addLoadingTab)
  const setTabReady = useEditorStore((state) => state.setTabReady)
  const setTabError = useEditorStore((state) => state.setTabError)
  const setTabSaving = useEditorStore((state) => state.setTabSaving)
  const markTabSaved = useEditorStore((state) => state.markTabSaved)
  const setActiveTab = useEditorStore((state) => state.setActiveTab)
  const closeTabStore = useEditorStore((state) => state.closeTab)

  const openFile = useCallback(
    async (input: OpenEditorFileInput) => {
      const existing = findTab(input)
      if (existing) {
        setActiveTab(existing.id)
        return
      }

      const tabId = addLoadingTab(input)

      try {
        const content = await readEditorFile(input)
        setTabReady(tabId, content)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to open file'
        setTabError(tabId, message)
        notifications.show({
          color: 'red',
          title: 'Open failed',
          message,
        })
      }
    },
    [addLoadingTab, findTab, setActiveTab, setTabError, setTabReady],
  )

  const saveTab = useCallback(
    async (tabId: string) => {
      const tab = useEditorStore.getState().tabs.find((entry) => entry.id === tabId)
      if (!tab || tab.status !== 'ready' || !tab.isDirty || tab.saving) return

      setTabSaving(tabId, true)

      try {
        await writeEditorFile(tab)
        markTabSaved(tabId)
        notifications.show({
          color: 'green',
          title: 'Saved',
          message: getEditorTabLabel(tab),
        })
      } catch (error) {
        setTabSaving(tabId, false)
        const message = error instanceof Error ? error.message : 'Failed to save file'
        notifications.show({
          color: 'red',
          title: 'Save failed',
          message,
        })
      }
    },
    [markTabSaved, setTabSaving],
  )

  const closeTab = useCallback(
    (tabId: string) => {
      const tab = useEditorStore.getState().tabs.find((entry) => entry.id === tabId)
      if (!tab) return

      if (tab.isDirty) {
        const discard = window.confirm(
          `"${getEditorTabLabel(tab)}" has unsaved changes. Discard them?`,
        )
        if (!discard) return
      }

      closeTabStore(tabId)
    },
    [closeTabStore],
  )

  return { openFile, saveTab, closeTab }
}
