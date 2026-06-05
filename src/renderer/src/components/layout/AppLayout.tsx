import { BOTTOM_HEADER_HEIGHT } from '../../constants/layout'
import { useServerModal } from '../../hooks/useServerModal'
import { useSidebarResize } from '../../hooks/useSidebarResize'
import { useWorkspaceResize } from '../../hooks/useWorkspaceResize'
import { TerminalProvider } from '../../providers/TerminalProvider'
import { FileExplorerPanel } from '../explorer/FileExplorerPanel'
import { EditorPanel } from '../editor/EditorPanel'
import { ServerFormModal } from '../server/ServerFormModal'
import { AppSidebar } from '../sidebar/AppSidebar'
import { AppHeader } from './AppHeader'
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
    startBottomResize,
    toggleBottomPanel,
  } = useWorkspaceResize()
  const { opened: serverModalOpen, editingServer, actions: serverModalActions } = useServerModal()

  const localExplorerWidth = `${localExplorerRatio * 100}%`

  return (
    <TerminalProvider>
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
            <div ref={workspaceColumnRef} className={classes.workspaceColumn}>
              <div
                ref={explorersRowRef}
                className={classes.explorersRow}
                style={{ height: explorersHeight }}
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

              <div
                className={classes.resizeHandleRow}
                onMouseDown={startExplorersResize}
                role="separator"
                aria-orientation="horizontal"
                aria-label="Resize explorers height"
              />

              <div className={classes.editorArea}>
                <EditorPanel />
              </div>

              <div
                className={classes.resizeHandleRow}
                onMouseDown={startBottomResize}
                role="separator"
                aria-orientation="horizontal"
                aria-label="Resize bottom panel height"
              />

              <div
                className={classes.bottomArea}
                style={{
                  height: bottomCollapsed ? BOTTOM_HEADER_HEIGHT : bottomHeight,
                }}
              >
                <BottomPanel collapsed={bottomCollapsed} onToggle={toggleBottomPanel} />
              </div>
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
