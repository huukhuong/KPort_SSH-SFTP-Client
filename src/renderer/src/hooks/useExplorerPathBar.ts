import type { ComboboxParsedItem } from '@mantine/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  directoryCacheScopes,
  getCachedDirectory,
  setCachedDirectory,
} from '../services/directoryListingCache'
import { listLocalDirectory } from '../services/fs'
import { listRemoteDirectory } from '../services/sftp'
import type { FileTreeNode } from '../types/fileTree'
import {
  normalizeExplorerPath,
  parsePathInputForCompletion,
  resolveExplorerInputPath,
  resolvePathSuggestions,
} from '../utils/fileTree'

interface UseExplorerPathBarOptions {
  currentPath: string
  homePath: string
  isLocal: boolean
  serverId?: string | null
  disabled?: boolean
  onNavigate: (path: string) => void
}

async function listDirectoryEntries(
  parentPath: string,
  isLocal: boolean,
  serverId: string | null | undefined,
): Promise<FileTreeNode[]> {
  const scope = isLocal
    ? directoryCacheScopes.local
    : serverId
      ? directoryCacheScopes.remote(serverId)
      : null

  if (!scope) return []

  const cached = getCachedDirectory(scope, parentPath)
  if (cached) return cached

  const entries = isLocal
    ? await listLocalDirectory(parentPath)
    : await listRemoteDirectory(serverId!, parentPath)

  setCachedDirectory(scope, parentPath, entries)
  return entries
}

function resolveNavigationTarget(
  value: string,
  options: { homePath: string; currentPath: string; isLocal: boolean },
): string | null {
  return resolveExplorerInputPath(value, options) ?? normalizeExplorerPath(value)
}

function getHighlightedSuggestionValue(): string | null {
  const option =
    document.querySelector<HTMLElement>('[data-combobox-option][data-combobox-selected]') ??
    document.querySelector<HTMLElement>('[data-combobox-option][data-combobox-active]')
  const text = option?.textContent?.trim()
  return text || null
}

export function useExplorerPathBar({
  currentPath,
  homePath,
  isLocal,
  serverId = null,
  disabled = false,
  onNavigate,
}: UseExplorerPathBarOptions) {
  const [draft, setDraft] = useState(currentPath)
  const [isEditing, setIsEditing] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [dropdownOpened, setDropdownOpened] = useState(false)
  const dropdownOpenedRef = useRef(false)
  const tabCompletionRef = useRef<string | null>(null)
  const userPickedSuggestionRef = useRef(false)
  const isSelectingRef = useRef(false)
  const blurTimeoutRef = useRef(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  const syncDropdownOpened = useCallback((open: boolean) => {
    dropdownOpenedRef.current = open
    setDropdownOpened(open)
  }, [])

  useEffect(() => {
    if (!isEditing) {
      setDraft(currentPath)
    }
  }, [currentPath, isEditing])

  useEffect(() => {
    if (!isEditing || disabled) {
      setSuggestions([])
      tabCompletionRef.current = null
      return
    }

    const parsed = parsePathInputForCompletion(draft, {
      homePath,
      currentPath,
      isLocal,
    })

    if (!parsed) {
      setSuggestions([])
      tabCompletionRef.current = null
      return
    }

    let cancelled = false
    const timer = window.setTimeout(() => {
      setLoadingSuggestions(true)

      void (async () => {
        try {
          const entries = await listDirectoryEntries(parsed.parentPath, isLocal, serverId)
          if (cancelled) return

          const result = resolvePathSuggestions(parsed.parentPath, entries, parsed.partial)

          tabCompletionRef.current = result.tabCompletion
          setSuggestions(result.suggestions)
        } catch {
          if (cancelled) return
          setSuggestions([])
          tabCompletionRef.current = null
        } finally {
          if (!cancelled) {
            setLoadingSuggestions(false)
          }
        }
      })()
    }, 120)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [currentPath, disabled, draft, homePath, isEditing, isLocal, serverId])

  useEffect(() => {
    if (!isEditing || suggestions.length === 0) return
    if (document.activeElement !== inputRef.current) return
    syncDropdownOpened(true)
  }, [isEditing, suggestions, syncDropdownOpened])

  useEffect(
    () => () => {
      window.clearTimeout(blurTimeoutRef.current)
    },
    [],
  )

  const finishNavigation = useCallback(
    (value: string) => {
      const resolved = resolveNavigationTarget(value, {
        homePath,
        currentPath,
        isLocal,
      })

      if (!resolved) {
        setDraft(currentPath)
        setIsEditing(false)
        setSuggestions([])
        syncDropdownOpened(false)
        return
      }

      onNavigate(resolved)
      setDraft(resolved)
      setIsEditing(false)
      setSuggestions([])
      syncDropdownOpened(false)
    },
    [currentPath, homePath, isLocal, onNavigate, syncDropdownOpened],
  )

  const commit = useCallback(() => {
    isSelectingRef.current = true
    finishNavigation(draft)
    window.setTimeout(() => {
      isSelectingRef.current = false
      inputRef.current?.blur()
    }, 0)
  }, [draft, finishNavigation])

  const cancel = useCallback(() => {
    setDraft(currentPath)
    setIsEditing(false)
    setSuggestions([])
    syncDropdownOpened(false)
  }, [currentPath, syncDropdownOpened])

  const handleOptionSubmit = useCallback(
    (value: string) => {
      isSelectingRef.current = true
      finishNavigation(value)
      window.setTimeout(() => {
        isSelectingRef.current = false
        inputRef.current?.blur()
      }, 0)
    },
    [finishNavigation],
  )

  const applyTabCompletion = useCallback(
    (fill: string) => {
      if (!fill || fill === draft) return

      setIsEditing(true)
      setDraft(fill)
      syncDropdownOpened(true)

      window.requestAnimationFrame(() => {
        const input = inputRef.current
        if (!input) return
        input.focus()
        const end = fill.length
        input.setSelectionRange(end, end)
      })
    },
    [draft, syncDropdownOpened],
  )

  const handleChange = useCallback((value: string) => {
    userPickedSuggestionRef.current = false
    setIsEditing(true)
    setDraft(value)
  }, [])

  const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    window.clearTimeout(blurTimeoutRef.current)
    userPickedSuggestionRef.current = false
    setIsEditing(true)
    syncDropdownOpened(true)
    event.currentTarget.select()
  }, [syncDropdownOpened])

  const handleBlur = useCallback(() => {
    window.clearTimeout(blurTimeoutRef.current)
    blurTimeoutRef.current = window.setTimeout(() => {
      if (isSelectingRef.current) return
      if (document.activeElement === inputRef.current) return
      cancel()
    }, 0)
  }, [cancel])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Tab' && !event.shiftKey) {
        const highlighted = getHighlightedSuggestionValue()
        const fill = highlighted ?? tabCompletionRef.current
        if (fill) {
          event.preventDefault()
          applyTabCompletion(fill)
        }
        return
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        userPickedSuggestionRef.current = true
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        const selectedValue = getHighlightedSuggestionValue()

        if (userPickedSuggestionRef.current && selectedValue) {
          isSelectingRef.current = true
          userPickedSuggestionRef.current = false
          handleOptionSubmit(selectedValue)
          return
        }

        userPickedSuggestionRef.current = false
        commit()
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        cancel()
        event.currentTarget.blur()
      }
    },
    [applyTabCompletion, commit, cancel, handleOptionSubmit],
  )

  return {
    pathInput: draft,
    pathInputDisabled: disabled,
    suggestions,
    loadingSuggestions,
    pathInputProps: {
      ref: inputRef,
      value: draft,
      disabled,
      data: suggestions,
      dropdownOpened,
      filter: ({ options }: { options: ComboboxParsedItem[] }) => options,
      selectFirstOptionOnChange: true,
      onChange: handleChange,
      onOptionSubmit: handleOptionSubmit,
      onDropdownOpen: () => syncDropdownOpened(true),
      onDropdownClose: () => syncDropdownOpened(false),
      onFocus: handleFocus,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      comboboxProps: {
        withinPortal: true,
      },
    },
  }
}
