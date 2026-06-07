import { create } from 'zustand'

export type BottomPanelTab = 'terminal' | 'transfers'

type ExpandBottomPanel = () => void

let expandBottomPanel: ExpandBottomPanel | null = null

interface BottomPanelStore {
  activeTab: BottomPanelTab
  setActiveTab: (tab: BottomPanelTab) => void
  openTransfersTab: () => void
}

export const useBottomPanelStore = create<BottomPanelStore>((set) => ({
  activeTab: 'terminal',

  setActiveTab: (tab) => set({ activeTab: tab }),

  openTransfersTab: () => {
    expandBottomPanel?.()
    set({ activeTab: 'transfers' })
  },
}))

export function registerBottomPanelExpand(handler: ExpandBottomPanel): () => void {
  expandBottomPanel = handler
  return () => {
    if (expandBottomPanel === handler) {
      expandBottomPanel = null
    }
  }
}
