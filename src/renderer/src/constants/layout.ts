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

export const TERMINAL_SPLIT_RATIO_DEFAULT = 0.5
export const TERMINAL_SPLIT_CHROME = RESIZE_HANDLE_SIZE + WORKSPACE_GAP * 2

export const WORKSPACE_STORAGE_KEY = 'kport:workspace-layout'

export interface WorkspaceLayout {
  explorersHeight: number
  bottomHeight: number
  localExplorerRatio: number
  terminalSplitRatio: number
  bottomCollapsed: boolean
}

export const WORKSPACE_LAYOUT_DEFAULT: WorkspaceLayout = {
  explorersHeight: EXPLORERS_HEIGHT_DEFAULT,
  bottomHeight: BOTTOM_HEIGHT_DEFAULT,
  localExplorerRatio: LOCAL_EXPLORER_RATIO_DEFAULT,
  terminalSplitRatio: TERMINAL_SPLIT_RATIO_DEFAULT,
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

export function getTerminalSplitSplittableHeight(columnHeight: number): number {
  return Math.max(0, columnHeight - TERMINAL_SPLIT_CHROME)
}

export function getTerminalSplitRatioBounds(columnHeight: number): { min: number; max: number } {
  const splittable = getTerminalSplitSplittableHeight(columnHeight)

  if (splittable <= 0) {
    return { min: TERMINAL_SPLIT_RATIO_DEFAULT, max: TERMINAL_SPLIT_RATIO_DEFAULT }
  }

  const min = EXPLORERS_HEIGHT_MIN / splittable
  const max = 1 - BOTTOM_HEIGHT_MIN / splittable

  return {
    min: clamp(min, 0, 1),
    max: clamp(max, 0, 1),
  }
}

export function clampTerminalSplitRatio(ratio: number, columnHeight: number): number {
  const { min, max } = getTerminalSplitRatioBounds(columnHeight)
  const safeMax = Math.max(min, max)

  return clamp(ratio, min, safeMax)
}

export function clampWorkspaceLayout(
  layout: WorkspaceLayout,
  columnHeight: number,
): WorkspaceLayout {
  const contentHeight = getWorkspaceContentHeight(columnHeight)
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
  const terminalSplitRatio = clampTerminalSplitRatio(layout.terminalSplitRatio, columnHeight)

  return { ...layout, explorersHeight, bottomHeight, terminalSplitRatio }
}
