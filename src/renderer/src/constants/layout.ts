export const SIDEBAR_WIDTH_DEFAULT = 240
export const SIDEBAR_WIDTH_MIN = 200
export const SIDEBAR_WIDTH_MAX = 420
export const SIDEBAR_WIDTH_STORAGE_KEY = 'kport:sidebar-width'

export const WORKSPACE_GAP = 4
export const RESIZE_HANDLE_SIZE = 8
export const WORKSPACE_RESIZE_CHROME = RESIZE_HANDLE_SIZE * 2 + WORKSPACE_GAP * 4

export const EXPLORERS_HEIGHT_DEFAULT = 220
export const EXPLORERS_HEIGHT_MIN = 140
export const EXPLORERS_HEIGHT_MAX = 420

export const EDITOR_HEIGHT_MIN = 120

export const BOTTOM_HEIGHT_DEFAULT = 200
export const BOTTOM_HEIGHT_MIN = 100
export const BOTTOM_HEIGHT_MAX = 480
export const BOTTOM_HEADER_HEIGHT = 36

export const LOCAL_EXPLORER_RATIO_DEFAULT = 0.42
export const LOCAL_EXPLORER_RATIO_MIN = 0.18
export const LOCAL_EXPLORER_RATIO_MAX = 0.82

export const WORKSPACE_STORAGE_KEY = 'kport:workspace-layout'

export interface WorkspaceLayout {
  explorersHeight: number
  bottomHeight: number
  localExplorerRatio: number
  bottomCollapsed: boolean
}

export const WORKSPACE_LAYOUT_DEFAULT: WorkspaceLayout = {
  explorersHeight: EXPLORERS_HEIGHT_DEFAULT,
  bottomHeight: BOTTOM_HEIGHT_DEFAULT,
  localExplorerRatio: LOCAL_EXPLORER_RATIO_DEFAULT,
  bottomCollapsed: false,
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function getWorkspaceContentHeight(columnHeight: number): number {
  return Math.max(0, columnHeight - WORKSPACE_RESIZE_CHROME)
}

export function getEffectiveBottomHeight(layout: WorkspaceLayout): number {
  return layout.bottomCollapsed ? BOTTOM_HEADER_HEIGHT : layout.bottomHeight
}

export function getMaxExplorersHeight(contentHeight: number, layout: WorkspaceLayout): number {
  return contentHeight - getEffectiveBottomHeight(layout) - EDITOR_HEIGHT_MIN
}

export function getMaxBottomHeight(contentHeight: number, explorersHeight: number): number {
  return contentHeight - explorersHeight - EDITOR_HEIGHT_MIN
}

export function clampWorkspaceLayout(
  layout: WorkspaceLayout,
  contentHeight: number,
): WorkspaceLayout {
  const maxExplorers = Math.min(
    EXPLORERS_HEIGHT_MAX,
    Math.max(EXPLORERS_HEIGHT_MIN, getMaxExplorersHeight(contentHeight, layout)),
  )
  const explorersHeight = clamp(layout.explorersHeight, EXPLORERS_HEIGHT_MIN, maxExplorers)

  const maxBottom = Math.min(
    BOTTOM_HEIGHT_MAX,
    Math.max(BOTTOM_HEIGHT_MIN, getMaxBottomHeight(contentHeight, explorersHeight)),
  )
  const bottomHeight = clamp(layout.bottomHeight, BOTTOM_HEIGHT_MIN, maxBottom)

  return { ...layout, explorersHeight, bottomHeight }
}
