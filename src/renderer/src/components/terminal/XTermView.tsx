import { Text } from '@mantine/core'
import { useXTermSession } from '../../hooks/useXTermSession'
import classes from '../../styles/layout.module.css'

interface XTermViewProps {
  tabId: string
  serverId: string | null
  isConnected: boolean
  initialCwd?: string
  isActive: boolean
  onReady: (tabId: string, terminalId: string) => void
  onClosed: (tabId: string) => void
}

export function XTermView({
  tabId,
  serverId,
  isConnected,
  initialCwd,
  isActive,
  onReady,
  onClosed,
}: XTermViewProps) {
  const canAttach = Boolean(serverId && isConnected)
  const { hostRef, status, errorMessage } = useXTermSession({
    tabId,
    serverId: canAttach ? serverId : null,
    isConnected: canAttach,
    initialCwd,
    isActive,
    onReady,
    onClosed,
  })

  if (!serverId) {
    return (
      <div className={classes.terminalPlaceholder}>
        <Text size="sm" c="dimmed">
          Select a server to open a terminal.
        </Text>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className={classes.terminalPlaceholder}>
        <Text size="sm" c="dimmed">
          Connect to the selected server to use the terminal.
        </Text>
      </div>
    )
  }

  return (
    <div className={classes.xtermHost}>
      <div ref={hostRef} className={classes.xtermSurface} />
      {status === 'connecting' && (
        <Text size="sm" c="dimmed" className={classes.terminalStatusOverlay}>
          Connecting…
        </Text>
      )}
      {status === 'error' && errorMessage && (
        <Text size="sm" c="red" className={classes.terminalStatusOverlay}>
          {errorMessage}
        </Text>
      )}
      {status === 'closed' && (
        <Text size="sm" c="dimmed" className={classes.terminalStatusOverlay}>
          Session ended. Open a new tab to start again.
        </Text>
      )}
    </div>
  )
}
