import { create } from 'zustand'
import { getMockFileContent, mockEditorTabs } from '../mocks/editorFiles'
import { getFileName } from '../utils/fileTree'
import type { EditorTab } from '../types'

interface EditorStore {
  tabs: EditorTab[]
  activeTabId: string | null
  openFile: (path: string) => void
  closeTab: (id: string) => void
  setActiveTab: (id: string) => void
  updateContent: (id: string, content: string) => void
}

function createTabId(path: string): string {
  return path.replace(/[^a-zA-Z0-9]+/g, '-')
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  tabs: mockEditorTabs,
  activeTabId: mockEditorTabs[0]?.id ?? null,

  openFile: (path) => {
    const existing = get().tabs.find((tab) => tab.path === path)
    if (existing) {
      set({ activeTabId: existing.id })
      return
    }

    const { content, language } = getMockFileContent(path)
    const tab: EditorTab = {
      id: createTabId(path),
      path,
      language,
      content,
      isDirty: false,
    }

    set((state) => ({
      tabs: [...state.tabs, tab],
      activeTabId: tab.id,
    }))
  },

  closeTab: (id) => {
    set((state) => {
      if (state.tabs.length <= 1) return state

      const index = state.tabs.findIndex((tab) => tab.id === id)
      if (index === -1) return state

      const nextTabs = state.tabs.filter((tab) => tab.id !== id)
      const nextActive =
        state.activeTabId === id
          ? nextTabs[Math.min(index, nextTabs.length - 1)]?.id ?? null
          : state.activeTabId

      return { tabs: nextTabs, activeTabId: nextActive }
    })
  },

  setActiveTab: (id) => set({ activeTabId: id }),

  updateContent: (id, content) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id ? { ...tab, content, isDirty: true } : tab,
      ),
    }))
  },
}))

export function getEditorTabLabel(tab: EditorTab): string {
  return getFileName(tab.path)
}
