import { ActionIcon, Group, Tabs } from '@mantine/core'
import { IconPlus, IconX } from '@tabler/icons-react'
import { useEffect } from 'react'
import { useTerminal } from '../../providers/TerminalProvider'
import {
  useTerminalSession,
  type TerminalHistoryEntry,
  type TerminalSession,
} from '../../hooks/useTerminalSession'
import classes from '../../styles/layout.module.css'
import { TerminalPromptLine } from './TerminalPromptLine'

const terminalTabStyles = {
  tab: {
    color: 'var(--mantine-color-dark-1)',
    fontSize: 12,
    fontWeight: 500,
    '&[data-active]': {
      color: 'var(--app-terminal-cmd)',
      borderColor: 'var(--mantine-color-blue-6)',
      backgroundColor: 'var(--app-active)',
    },
    '&:hover:not([data-active])': {
      color: 'var(--mantine-color-dark-0)',
      backgroundColor: 'var(--app-hover)',
    },
  },
}

function HistoryLine({ entry, cwd }: { entry: TerminalHistoryEntry; cwd: string }) {
  if (entry.type === 'command') {
    return <TerminalPromptLine cwd={cwd} command={entry.text} />
  }

  if (entry.type === 'output-header') {
    return <div className={`${classes.terminalLine} ${classes.terminalOutputHeader}`}>{entry.text}</div>
  }

  if (entry.type === 'error') {
    return <div className={`${classes.terminalLine} ${classes.terminalError}`}>{entry.text}</div>
  }

  return <div className={`${classes.terminalLine} ${classes.terminalOutput}`}>{entry.text}</div>
}

interface InteractiveTerminalProps {
  session: TerminalSession
  isActive: boolean
  onSessionChange: (updater: (current: TerminalSession) => TerminalSession) => void
}

function InteractiveTerminal({ session, isActive, onSessionChange }: InteractiveTerminalProps) {
  const {
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
  } = useTerminalSession(session, onSessionChange, { isActive })

  useEffect(() => {
    if (isActive) {
      focus()
    }
  }, [isActive, focus])

  return (
    <div
      ref={bodyRef}
      className={`${classes.terminalBody} ${classes.terminalBodyInteractive}`}
      tabIndex={isActive ? 0 : -1}
      role="textbox"
      aria-label="Terminal input"
      aria-multiline="true"
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onClick={(event) => {
        if (event.target === bodyRef.current) {
          focus()
        }
      }}
    >
      {history.map((entry, index) => (
        <HistoryLine key={`${entry.type}-${index}`} entry={entry} cwd={session.cwd} />
      ))}
      <TerminalPromptLine
        cwd={session.cwd}
        input={input}
        cursorLeft={cursorLeft}
        showCursor={isActive}
        inputRef={inputRef}
        onInputClick={handleInputClick}
      />
      <div ref={endRef} className={classes.terminalScrollAnchor} aria-hidden />
    </div>
  )
}

interface TerminalTabLabelProps {
  title: string
  closable: boolean
  onClose: () => void
}

function TerminalTabLabel({ title, closable, onClose }: TerminalTabLabelProps) {
  return (
    <Group gap={6} wrap="nowrap" className={classes.terminalTabLabel}>
      <span className={classes.terminalTabTitle}>{title}</span>
      {closable && (
        <ActionIcon
          component="span"
          variant="transparent"
          size="xs"
          aria-label={`Close ${title}`}
          className={classes.terminalTabClose}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation()
            onClose()
          }}
        >
          <IconX size={12} />
        </ActionIcon>
      )}
    </Group>
  )
}

export function TerminalPanel() {
  const {
    tabs,
    activeTabId,
    setActiveTabId,
    addTab,
    removeTab,
    sessions,
    updateSession,
  } = useTerminal()

  return (
    <Tabs
      value={activeTabId}
      onChange={(value) => value && setActiveTabId(value)}
      variant="outline"
      styles={{
        root: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 },
        panel: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
        list: { flexShrink: 0 },
        tab: terminalTabStyles.tab,
      }}
    >
      <Tabs.List className={classes.terminalTabBar}>
        {tabs.map((tab) => (
          <Tabs.Tab key={tab.id} value={tab.id}>
            <TerminalTabLabel
              title={tab.title}
              closable={tabs.length > 1}
              onClose={() => removeTab(tab.id)}
            />
          </Tabs.Tab>
        ))}
        <ActionIcon
          variant="subtle"
          size="sm"
          aria-label="New terminal tab"
          onClick={addTab}
          className={classes.terminalTabAdd}
        >
          <IconPlus size={14} />
        </ActionIcon>
      </Tabs.List>

      {tabs.map((tab) => {
        const session = sessions[tab.id]
        if (!session) return null

        const isActive = tab.id === activeTabId

        return (
          <Tabs.Panel key={tab.id} value={tab.id} className={classes.terminalTabPanel}>
            <InteractiveTerminal
              session={session}
              isActive={isActive}
              onSessionChange={(updater) => updateSession(tab.id, updater)}
            />
          </Tabs.Panel>
        )
      })}
    </Tabs>
  )
}
