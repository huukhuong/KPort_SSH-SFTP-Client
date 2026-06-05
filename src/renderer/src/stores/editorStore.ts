import { create } from 'zustand'
import type { EditorFileSide } from '../../../shared/editor'
import type { EditorTab } from '../types'
import { getLanguageForPath } from '../utils/editorLanguage'
import { getFileName } from '../utils/fileTree'

export interface OpenEditorTabInput {
  path: string
  side: EditorFileSide
  serverId?: string | null
}

interface EditorStore {
  tabs: EditorTab[]
  activeTabId: string | null
  findTab: (input: OpenEditorTabInput) => EditorTab | undefined
  addLoadingTab: (input: OpenEditorTabInput) => string
  setTabReady: (id: string, content: string) => void
  setTabError: (id: string, error: string) => void
  setTabSaving: (id: string, saving: boolean) => void
  markTabSaved: (id: string) => void
  closeTab: (id: string) => void
  setActiveTab: (id: string) => void
  updateContent: (id: string, content: string) => void
}

export function createEditorTabId(input: OpenEditorTabInput): string {
  const prefix = input.side === 'local' ? 'local' : `remote-${input.serverId ?? 'unknown'}`
  return `${prefix}-${input.path.replace(/[^a-zA-Z0-9]+/g, '-')}`
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  tabs: [],
  activeTabId: null,

  findTab: (input) => {
    const id = createEditorTabId(input)
    return get().tabs.find((tab) => tab.id === id)
  },

  addLoadingTab: (input) => {
    const id = createEditorTabId(input)
    const existing = get().tabs.find((tab) => tab.id === id)

    if (existing) {
      set({ activeTabId: existing.id })
      return existing.id
    }

    const tab: EditorTab = {
      id,
      path: input.path,
      side: input.side,
      serverId: input.side === 'remote' ? (input.serverId ?? null) : null,
      language: getLanguageForPath(input.path),
      content: '',
      savedContent: '',
      isDirty: false,
      status: 'loading',
    }

    set((state) => ({
      tabs: [...state.tabs, tab],
      activeTabId: id,
    }))

    return id
  },

  setTabReady: (id, content) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id
          ? {
              ...tab,
              content,
              savedContent: content,
              isDirty: false,
              status: 'ready',
              error: undefined,
            }
          : tab,
      ),
    }))
  },

  setTabError: (id, error) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id ? { ...tab, status: 'error', error } : tab,
      ),
    }))
  },

  setTabSaving: (id, saving) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === id ? { ...tab, saving } : tab)),
    }))
  },

  markTabSaved: (id) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id
          ? {
              ...tab,
              savedContent: tab.content,
              isDirty: false,
              saving: false,
            }
          : tab,
      ),
    }))
  },

  closeTab: (id) => {
    set((state) => {
      const index = state.tabs.findIndex((tab) => tab.id === id)
      if (index === -1) return state

      const nextTabs = state.tabs.filter((tab) => tab.id !== id)
      const nextActive =
        state.activeTabId === id
          ? (nextTabs[Math.min(index, nextTabs.length - 1)]?.id ?? null)
          : state.activeTabId

      return { tabs: nextTabs, activeTabId: nextActive }
    })
  },

  setActiveTab: (id) => set({ activeTabId: id }),

  updateContent: (id, content) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id
          ? { ...tab, content, isDirty: content !== tab.savedContent }
          : tab,
      ),
    }))
  },
}))

export function getEditorTabLabel(tab: EditorTab): string {
  const name = getFileName(tab.path)
  return tab.side === 'remote' ? `${name}` : name
}
