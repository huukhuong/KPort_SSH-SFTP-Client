import { useEditorStore } from '../stores/editorStore'
import { useServerStore } from '../stores/serverStore'

export function useWorkspaceVisibility() {
  const hasEditorTabs = useEditorStore((state) => state.tabs.length > 0)
  const activeServer = useServerStore((state) =>
    state.servers.find((server) => server.id === state.activeServerId),
  )
  const isServerConnected = activeServer?.status === 'connected'

  const showBottomPanel = isServerConnected
  const bottomPanelFillsWorkspace = showBottomPanel && !hasEditorTabs
  const explorersExpanded = !hasEditorTabs && !showBottomPanel

  return {
    hasEditorTabs,
    showBottomPanel,
    bottomPanelFillsWorkspace,
    explorersExpanded,
    explorersUseFixedHeight: hasEditorTabs,
  }
}
