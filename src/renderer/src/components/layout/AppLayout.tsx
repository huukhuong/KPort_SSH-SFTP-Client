import { useEffect } from 'react'
import { BOTTOM_HEADER_HEIGHT } from '../../constants/layout'
import { useServerModal } from '../../hooks/useServerModal'
import { registerBottomPanelExpand } from '../../stores/bottomPanelStore'
import { useWorkspaceVisibility } from '../../hooks/useWorkspaceVisibility'
import { useSidebarResize } from '../../hooks/useSidebarResize'
import { useWorkspaceResize } from '../../hooks/useWorkspaceResize'
import { TerminalProvider } from '../../providers/TerminalProvider'
import { FileExplorerPanel } from '../explorer/FileExplorerPanel'
import { EditorPanel } from '../editor/EditorPanel'
import { ServerFormModal } from '../server/ServerFormModal'
import { AppSidebar } from '../sidebar/AppSidebar'
import { AppHeader } from './AppHeader'
import { TransferEventBridge } from '../transfer/TransferEventBridge'
import { BottomPanel } from './BottomPanel'
import classes from '../../styles/layout.module.css'

export function AppLayout() {
  const { sidebarOpen, sidebarWidth, toggleSidebar, startResize } = useSidebarResize()
  const {
    workspaceColumnRef,
    explorersRowRef,
    explorersHeight,
    bottomHeight,
    localExplorerRatio,
    bottomCollapsed,
    startLocalResize,
    startExplorersResize,
    startTerminalSplitResize,
    startBottomResize,
    terminalSplitRatio,
    toggleBottomPanel,
  } = useWorkspaceResize()
  const { opened: serverModalOpen, editingServer, actions: serverModalActions } = useServerModal()
  const {
    hasEditorTabs,
    showBottomPanel,
    explorersExpanded,
    explorersUseFixedHeight,
    bottomPanelFillsWorkspace,
  } = useWorkspaceVisibility()

  const localExplorerWidth = `${localExplorerRatio * 100}%`
  const bottomAreaStyle = bottomCollapsed
    ? { height: BOTTOM_HEADER_HEIGHT }
    : bottomPanelFillsWorkspace
      ? undefined
      : { height: bottomHeight }

  const workspaceColumnStyle = bottomPanelFillsWorkspace
    ? {
        gridTemplateRows: `${terminalSplitRatio}fr 8px ${1 - terminalSplitRatio}fr`,
      }
    : undefined

  useEffect(() => {
    return registerBottomPanelExpand(() => {
      if (bottomCollapsed) {
        toggleBottomPanel()
      }
    })
  }, [bottomCollapsed, toggleBottomPanel])

  return (
    <TerminalProvider>
      <TransferEventBridge />
      <div className={classes.shell}>
        <header className={classes.appHeader}>
          <AppHeader onToggleSidebar={toggleSidebar} sidebarOpened={sidebarOpen} />
        </header>

        <div className={classes.bodyRow}>
          {sidebarOpen && (
            <>
              <aside className={classes.sidebar} style={{ width: sidebarWidth }}>
                <AppSidebar
                  onAddServer={serverModalActions.openAdd}
                  onEditServer={serverModalActions.openEdit}
                />
              </aside>
              <div
                className={classes.sidebarResizeHandle}
                onMouseDown={startResize}
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize sidebar"
              />
            </>
          )}

          <main className={classes.mainArea}>
            <div
              ref={workspaceColumnRef}
              className={`${classes.workspaceColumn} ${bottomPanelFillsWorkspace ? classes.workspaceColumnTerminalFill : ''}`}
              style={workspaceColumnStyle}
            >
              <div
                ref={explorersRowRef}
                className={`${classes.explorersRow} ${explorersExpanded ? classes.explorersRowExpanded : ''}`}
                style={explorersUseFixedHeight ? { height: explorersHeight } : undefined}
              >
                <div
                  className={`${classes.explorerPane} ${classes.explorerPaneLocal}`}
                  style={{ width: localExplorerWidth, flex: '0 0 auto' }}
                >
                  <FileExplorerPanel side="local" />
                </div>

                <div
                  className={classes.resizeHandleCol}
                  onMouseDown={startLocalResize}
                  role="separator"
                  aria-orientation="vertical"
                  aria-label="Resize local and remote explorers"
                />

                <div
                  className={`${classes.explorerPane} ${classes.explorerPaneGrow} ${classes.explorerPaneRemote}`}
                >
                  <FileExplorerPanel side="remote" />
                </div>
              </div>

              {hasEditorTabs && (
                <div
                  className={classes.resizeHandleRow}
                  onMouseDown={startExplorersResize}
                  role="separator"
                  aria-orientation="horizontal"
                  aria-label="Resize explorers height"
                />
              )}

              {hasEditorTabs && (
                <div className={classes.editorArea}>
                  <EditorPanel />
                </div>
              )}

              {showBottomPanel && (
                <div
                  className={classes.resizeHandleRow}
                  onMouseDown={
                    bottomPanelFillsWorkspace ? startTerminalSplitResize : startBottomResize
                  }
                  role="separator"
                  aria-orientation="horizontal"
                  aria-label={
                    bottomPanelFillsWorkspace
                      ? 'Resize explorers and terminal height'
                      : 'Resize bottom panel height'
                  }
                />
              )}

              {showBottomPanel && (
                <div
                  className={`${classes.bottomArea} ${bottomPanelFillsWorkspace && !bottomCollapsed ? classes.bottomAreaGrow : ''} ${bottomPanelFillsWorkspace ? classes.bottomAreaGridCell : ''}`}
                  style={bottomAreaStyle}
                >
                  <BottomPanel collapsed={bottomCollapsed} onToggle={toggleBottomPanel} />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <ServerFormModal
        opened={serverModalOpen}
        onClose={serverModalActions.close}
        editingServer={editingServer}
      />
    </TerminalProvider>
  )
}
