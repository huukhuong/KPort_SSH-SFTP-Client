import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import {
  getCursorIndexFromClick,
  getInputCursorLeft,
  getMonospaceFont,
  nextWordIndex,
  prevWordIndex,
  TERMINAL_INPUT_LEADING_SPACE,
} from '../utils/terminalMeasure'

export type TerminalHistoryEntry =
  | { type: 'command'; text: string }
  | { type: 'output-header'; text: string }
  | { type: 'output'; text: string }
  | { type: 'error'; text: string }

export interface TerminalInputState {
  value: string
  cursor: number
}

export interface TerminalSession {
  history: TerminalHistoryEntry[]
  inputState: TerminalInputState
}

const INITIAL_HISTORY: TerminalHistoryEntry[] = [
  { type: 'command', text: 'docker ps' },
  { type: 'output-header', text: 'CONTAINER ID   IMAGE          STATUS' },
  { type: 'output', text: 'a1b2c3d4e5f6   api:latest     Up 2 hours' },
]

export const EMPTY_INPUT: TerminalInputState = { value: '', cursor: 0 }

export function createDefaultSession(): TerminalSession {
  return {
    history: [...INITIAL_HISTORY],
    inputState: { ...EMPTY_INPUT },
  }
}

export function createEmptySession(): TerminalSession {
  return {
    history: [],
    inputState: { ...EMPTY_INPUT },
  }
}

function runMockCommand(command: string): TerminalHistoryEntry[] {
  const cmd = command.trim()

  switch (cmd) {
    case 'docker ps':
      return [
        { type: 'output-header', text: 'CONTAINER ID   IMAGE          STATUS' },
        { type: 'output', text: 'a1b2c3d4e5f6   api:latest     Up 2 hours' },
      ]
    case 'help':
      return [
        {
          type: 'output',
          text: 'Mock shell — ⌘←/→ line ends, ⌥←/→ words, ←/→ chars. Try: docker ps, clear, help',
        },
      ]
    case 'clear':
      return []
    default:
      if (cmd.startsWith('echo ')) {
        return [{ type: 'output', text: cmd.slice(5) }]
      }

      return [{ type: 'error', text: `${cmd}: command not found` }]
  }
}

function isPrintableKey(key: string): boolean {
  return key.length === 1 && !key.startsWith('Arrow')
}

function clampCursor(index: number, length: number): number {
  return Math.max(0, Math.min(length, index))
}

function resolveArrowLeftCursor(
  event: React.KeyboardEvent,
  value: string,
  cursor: number,
): number {
  if (event.metaKey) return 0
  if (event.altKey || event.ctrlKey) return prevWordIndex(value, cursor)
  return clampCursor(cursor - 1, value.length)
}

function resolveArrowRightCursor(
  event: React.KeyboardEvent,
  value: string,
  cursor: number,
): number {
  if (event.metaKey) return value.length
  if (event.altKey || event.ctrlKey) return nextWordIndex(value, cursor)
  return clampCursor(cursor + 1, value.length)
}

interface UseTerminalSessionOptions {
  isActive?: boolean
}

export function useTerminalSession(
  session: TerminalSession,
  onSessionChange: (updater: (current: TerminalSession) => TerminalSession) => void,
  { isActive = true }: UseTerminalSessionOptions = {},
) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLSpanElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const [cursorLeft, setCursorLeft] = useState(0)

  const { history, inputState } = session
  const { value: input, cursor: cursorIndex } = inputState

  const updateInput = useCallback(
    (updater: (current: TerminalInputState) => TerminalInputState) => {
      onSessionChange((current) => ({
        ...current,
        inputState: updater(current.inputState),
      }))
    },
    [onSessionChange],
  )

  useLayoutEffect(() => {
    const node = inputRef.current
    if (!node) return

    const font = getMonospaceFont(node)
    setCursorLeft(getInputCursorLeft(input, cursorIndex, font))
  }, [input, cursorIndex])

  const scrollToBottom = useCallback(() => {
    const node = bodyRef.current
    if (node) {
      node.scrollTop = node.scrollHeight
    }

    endRef.current?.scrollIntoView({ block: 'end' })
  }, [])

  useLayoutEffect(() => {
    if (!isActive) return

    scrollToBottom()
    bodyRef.current?.focus()
  }, [history, input, isActive, scrollToBottom])

  const submit = useCallback(() => {
    const cmd = input.trim()

    if (cmd === 'clear') {
      onSessionChange(() => ({
        history: [],
        inputState: { ...EMPTY_INPUT },
      }))
      requestAnimationFrame(() => {
        scrollToBottom()
        bodyRef.current?.focus()
      })
      return
    }

    const output = cmd ? runMockCommand(cmd) : []

    onSessionChange((current) => ({
      history: [
        ...current.history,
        { type: 'command', text: input },
        ...output,
      ],
      inputState: { ...EMPTY_INPUT },
    }))
    requestAnimationFrame(() => {
      scrollToBottom()
      bodyRef.current?.focus()
    })
  }, [input, onSessionChange, scrollToBottom])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        submit()
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        updateInput((current) => ({
          ...current,
          cursor: resolveArrowLeftCursor(event, current.value, current.cursor),
        }))
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        updateInput((current) => ({
          ...current,
          cursor: resolveArrowRightCursor(event, current.value, current.cursor),
        }))
        return
      }

      if (event.key === 'Home') {
        event.preventDefault()
        updateInput((current) => ({ ...current, cursor: 0 }))
        return
      }

      if (event.key === 'End') {
        event.preventDefault()
        updateInput((current) => ({ ...current, cursor: current.value.length }))
        return
      }

      if (event.key === 'Backspace') {
        event.preventDefault()
        updateInput((current) => {
          if (current.cursor === 0) return current

          const nextCursor = current.cursor - 1
          return {
            value:
              current.value.slice(0, nextCursor) + current.value.slice(current.cursor),
            cursor: nextCursor,
          }
        })
        return
      }

      if (event.key === 'Delete') {
        event.preventDefault()
        updateInput((current) => {
          if (current.cursor >= current.value.length) return current

          return {
            value:
              current.value.slice(0, current.cursor) +
              current.value.slice(current.cursor + 1),
            cursor: current.cursor,
          }
        })
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (isPrintableKey(event.key)) {
        event.preventDefault()
        updateInput((current) => ({
          value:
            current.value.slice(0, current.cursor) +
            event.key +
            current.value.slice(current.cursor),
          cursor: current.cursor + 1,
        }))
      }
    },
    [submit, updateInput],
  )

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      event.preventDefault()
      const text = event.clipboardData.getData('text').replace(/\r?\n/g, ' ')
      if (!text) return

      updateInput((current) => ({
        value:
          current.value.slice(0, current.cursor) +
          text +
          current.value.slice(current.cursor),
        cursor: current.cursor + text.length,
      }))
    },
    [updateInput],
  )

  const handleInputClick = useCallback(
    (event: React.MouseEvent<HTMLSpanElement>) => {
      event.stopPropagation()

      const node = inputRef.current
      if (!node) return

      const font = getMonospaceFont(node)
      const offsetX = event.clientX - node.getBoundingClientRect().left
      const displayText = `${TERMINAL_INPUT_LEADING_SPACE}${input}`
      const displayIndex = getCursorIndexFromClick(displayText, offsetX, font)
      const nextCursor = clampCursor(
        displayIndex - TERMINAL_INPUT_LEADING_SPACE.length,
        input.length,
      )

      updateInput((current) => ({ ...current, cursor: nextCursor }))
      bodyRef.current?.focus()
    },
    [input, updateInput],
  )

  const focus = useCallback(() => {
    bodyRef.current?.focus()
  }, [])

  return {
    bodyRef,
    inputRef,
    endRef,
    history,
    input,
    cursorLeft,
    handleKeyDown,
    handlePaste,
    handleInputClick,
    focus,
  }
}
