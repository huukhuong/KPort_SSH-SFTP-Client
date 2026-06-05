import { useCallback, useEffect, useRef, useState } from 'react'
import {
  BOTTOM_HEIGHT_DEFAULT,
  BOTTOM_HEIGHT_MAX,
  BOTTOM_HEIGHT_MIN,
  EXPLORERS_HEIGHT_DEFAULT,
  EXPLORERS_HEIGHT_MAX,
  EXPLORERS_HEIGHT_MIN,
  LOCAL_EXPLORER_RATIO_DEFAULT,
  LOCAL_EXPLORER_RATIO_MAX,
  LOCAL_EXPLORER_RATIO_MIN,
  WORKSPACE_LAYOUT_DEFAULT,
  WORKSPACE_STORAGE_KEY,
  clampWorkspaceLayout,
  getMaxBottomHeight,
  getMaxExplorersHeight,
  getWorkspaceContentHeight,
  type WorkspaceLayout,
} from '../constants/layout'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function readStoredLayout(): WorkspaceLayout {
  const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY)

  if (!raw) {
    return WORKSPACE_LAYOUT_DEFAULT
  }

  try {
    const parsed = JSON.parse(raw) as Partial<WorkspaceLayout>

    return {
      explorersHeight: clamp(
        Number(parsed.explorersHeight) || EXPLORERS_HEIGHT_DEFAULT,
        EXPLORERS_HEIGHT_MIN,
        EXPLORERS_HEIGHT_MAX,
      ),
      bottomHeight: clamp(
        Number(parsed.bottomHeight) || BOTTOM_HEIGHT_DEFAULT,
        BOTTOM_HEIGHT_MIN,
        BOTTOM_HEIGHT_MAX,
      ),
      localExplorerRatio: clamp(
        Number(parsed.localExplorerRatio) || LOCAL_EXPLORER_RATIO_DEFAULT,
        LOCAL_EXPLORER_RATIO_MIN,
        LOCAL_EXPLORER_RATIO_MAX,
      ),
      bottomCollapsed: Boolean(parsed.bottomCollapsed),
    }
  } catch {
    return WORKSPACE_LAYOUT_DEFAULT
  }
}

function getContentHeight(column: HTMLDivElement | null): number {
  return column ? getWorkspaceContentHeight(column.clientHeight) : Number.POSITIVE_INFINITY
}

function useDragResize(cursor: 'col-resize' | 'row-resize') {
  return useCallback((onMove: (event: MouseEvent) => void) => {
    return (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault()

      const onMouseMove = (moveEvent: MouseEvent) => {
        onMove(moveEvent)
      }

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
      document.body.style.cursor = cursor
      document.body.style.userSelect = 'none'
    }
  }, [cursor])
}

export function useWorkspaceResize() {
  const [layout, setLayout] = useState<WorkspaceLayout>(readStoredLayout)
  const workspaceColumnRef = useRef<HTMLDivElement>(null)
  const explorersRowRef = useRef<HTMLDivElement>(null)
  const startDragCol = useDragResize('col-resize')
  const startDragRow = useDragResize('row-resize')

  useEffect(() => {
    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(layout))
  }, [layout])

  useEffect(() => {
    const column = workspaceColumnRef.current
    if (!column) return

    const syncLayout = () => {
      const contentHeight = getWorkspaceContentHeight(column.clientHeight)
      setLayout((current) => clampWorkspaceLayout(current, contentHeight))
    }

    syncLayout()

    const observer = new ResizeObserver(syncLayout)
    observer.observe(column)

    return () => observer.disconnect()
  }, [])

  const startLocalResize = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const row = explorersRowRef.current
      if (!row) return

      const rect = row.getBoundingClientRect()

      startDragCol((moveEvent) => {
        const ratio = (moveEvent.clientX - rect.left) / rect.width
        setLayout((current) => ({
          ...current,
          localExplorerRatio: clamp(
            ratio,
            LOCAL_EXPLORER_RATIO_MIN,
            LOCAL_EXPLORER_RATIO_MAX,
          ),
        }))
      })(event)
    },
    [startDragCol],
  )

  const startExplorersResize = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const startY = event.clientY
      const startHeight = layout.explorersHeight

      startDragRow((moveEvent) => {
        const nextHeight = startHeight + (moveEvent.clientY - startY)
        const contentHeight = getContentHeight(workspaceColumnRef.current)

        setLayout((current) => {
          const maxHeight = Math.min(
            EXPLORERS_HEIGHT_MAX,
            Math.max(EXPLORERS_HEIGHT_MIN, getMaxExplorersHeight(contentHeight, current)),
          )

          return {
            ...current,
            explorersHeight: clamp(nextHeight, EXPLORERS_HEIGHT_MIN, maxHeight),
          }
        })
      })(event)
    },
    [layout.explorersHeight, startDragRow],
  )

  const startBottomResize = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const startY = event.clientY
      const startHeight = layout.bottomCollapsed ? BOTTOM_HEIGHT_DEFAULT : layout.bottomHeight

      startDragRow((moveEvent) => {
        const delta = startY - moveEvent.clientY
        const nextHeight = startHeight + delta
        const contentHeight = getContentHeight(workspaceColumnRef.current)

        setLayout((current) => {
          const maxHeight = Math.min(
            BOTTOM_HEIGHT_MAX,
            Math.max(BOTTOM_HEIGHT_MIN, getMaxBottomHeight(contentHeight, current.explorersHeight)),
          )

          return {
            ...current,
            bottomCollapsed: false,
            bottomHeight: clamp(nextHeight, BOTTOM_HEIGHT_MIN, maxHeight),
          }
        })
      })(event)
    },
    [layout.bottomCollapsed, layout.bottomHeight, startDragRow],
  )

  const toggleBottomPanel = useCallback(() => {
    setLayout((current) => ({
      ...current,
      bottomCollapsed: !current.bottomCollapsed,
    }))
  }, [])

  return {
    workspaceColumnRef,
    explorersRowRef,
    explorersHeight: layout.explorersHeight,
    bottomHeight: layout.bottomHeight,
    localExplorerRatio: layout.localExplorerRatio,
    bottomCollapsed: layout.bottomCollapsed,
    startLocalResize,
    startExplorersResize,
    startBottomResize,
    toggleBottomPanel,
  }
}
