import { FitAddon } from '@xterm/addon-fit'
import { Terminal } from '@xterm/xterm'
import { useEffect, useRef, useState } from 'react'
import {
  createTerminal,
  destroyTerminal,
  onTerminalData,
  onTerminalExit,
  resizeTerminal,
  writeTerminal,
} from '../services/terminal'

const MIN_TERMINAL_COLS = 2
const MIN_TERMINAL_ROWS = 2

function normalizeTerminalSize(cols: number, rows: number) {
  return {
    cols: Math.max(MIN_TERMINAL_COLS, cols || 80),
    rows: Math.max(MIN_TERMINAL_ROWS, rows || 24),
  }
}

function createTerminalId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `term-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

interface UseXTermSessionOptions {
  tabId: string
  serverId: string | null
  isConnected: boolean
  isActive: boolean
  initialCwd?: string
  onReady?: (tabId: string, terminalId: string) => void
  onClosed?: (tabId: string) => void
}

export function useXTermSession({
  tabId,
  serverId,
  isConnected,
  isActive,
  initialCwd,
  onReady,
  onClosed,
}: UseXTermSessionOptions) {
  const hostRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const terminalIdRef = useRef<string | null>(null)
  const initialCwdRef = useRef(initialCwd)
  const onReadyRef = useRef(onReady)
  const onClosedRef = useRef(onClosed)
  const [status, setStatus] = useState<'idle' | 'connecting' | 'ready' | 'closed' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    initialCwdRef.current = initialCwd
  }, [initialCwd])

  useEffect(() => {
    onReadyRef.current = onReady
    onClosedRef.current = onClosed
  }, [onReady, onClosed])

  useEffect(() => {
    const host = hostRef.current
    if (!host || !serverId || !isConnected) {
      return
    }

    let disposed = false
    const terminalId = createTerminalId()
    terminalIdRef.current = terminalId

    const xterm = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      convertEol: true,
      scrollback: 5000,
      theme: {
        background: '#141517',
        foreground: '#e4eaf4',
        cursor: '#ffffff',
      },
    })
    const fitAddon = new FitAddon()

    xterm.loadAddon(fitAddon)
    xterm.open(host)
    terminalRef.current = xterm
    fitAddonRef.current = fitAddon

    const unsubscribeData = onTerminalData((event) => {
      if (event.terminalId !== terminalId) return
      xterm.write(event.data)
    })

    const unsubscribeExit = onTerminalExit((event) => {
      if (event.terminalId !== terminalId) return
      terminalIdRef.current = null
      setStatus('closed')
      xterm.writeln('\r\n\x1b[90m[session ended]\x1b[0m')
      onClosedRef.current?.(tabId)
    })

    const inputDisposable = xterm.onData((data) => {
      if (!terminalIdRef.current) return
      void writeTerminal(terminalIdRef.current, data)
    })

    let resizeTimer: ReturnType<typeof setTimeout> | undefined

    const fitAndResize = () => {
      if (!fitAddonRef.current || !terminalRef.current || !hostRef.current || !terminalIdRef.current) {
        return
      }

      if (hostRef.current.clientWidth < 8 || hostRef.current.clientHeight < 8) {
        return
      }

      fitAddonRef.current.fit()
      const { cols, rows } = normalizeTerminalSize(
        terminalRef.current.cols,
        terminalRef.current.rows,
      )

      void resizeTerminal({ terminalId: terminalIdRef.current, cols, rows })
    }

    const resizeObserver = new ResizeObserver(() => {
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(fitAndResize, 50)
    })
    resizeObserver.observe(host)

    const openSession = async () => {
      setStatus('connecting')
      setErrorMessage(null)

      try {
        requestAnimationFrame(() => {
          fitAndResize()
        })

        const dimensions = normalizeTerminalSize(
          terminalRef.current?.cols ?? 80,
          terminalRef.current?.rows ?? 24,
        )

        await createTerminal({
          terminalId,
          serverId,
          cols: dimensions.cols,
          rows: dimensions.rows,
          initialCwd: initialCwdRef.current,
        })

        if (disposed) {
          await destroyTerminal(terminalId)
          return
        }

        setStatus('ready')
        onReadyRef.current?.(tabId, terminalId)
        requestAnimationFrame(() => {
          fitAndResize()
          xterm.focus()
        })
      } catch (error) {
        if (disposed) return
        terminalIdRef.current = null
        setStatus('error')
        const message = error instanceof Error ? error.message : 'Failed to open terminal'
        setErrorMessage(message)
        xterm.writeln(`\r\n\x1b[31m${message}\x1b[0m`)
      }
    }

    void openSession()

    return () => {
      disposed = true
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeObserver.disconnect()
      unsubscribeData()
      unsubscribeExit()
      inputDisposable.dispose()

      const activeTerminalId = terminalIdRef.current
      terminalIdRef.current = null
      if (activeTerminalId) {
        void destroyTerminal(activeTerminalId)
      }

      xterm.dispose()
      terminalRef.current = null
      fitAddonRef.current = null
    }
  }, [tabId, serverId, isConnected])

  useEffect(() => {
    if (!isActive) return

    const fitAddon = fitAddonRef.current
    const xterm = terminalRef.current
    const host = hostRef.current
    if (!fitAddon || !xterm || !host || host.clientWidth < 8) return

    requestAnimationFrame(() => {
      fitAddon.fit()
      const terminalId = terminalIdRef.current
      if (terminalId) {
        const { cols, rows } = normalizeTerminalSize(xterm.cols, xterm.rows)
        void resizeTerminal({ terminalId, cols, rows })
      }
      xterm.focus()
    })
  }, [isActive])

  return {
    hostRef,
    status,
    errorMessage,
  }
}
