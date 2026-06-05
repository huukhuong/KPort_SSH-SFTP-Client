import { ActionIcon, Group } from '@mantine/core'
import { IconPlus, IconX } from '@tabler/icons-react'
import { useTerminalPanel } from '../../hooks/useTerminalPanel'
import classes from '../../styles/layout.module.css'
import { XTermView } from './XTermView'

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
  const { tabs, activeTabId, isTabConnected, actions } = useTerminalPanel()

  return (
    <div className={classes.terminalPanelRoot}>
      <div className={classes.terminalTabBar} role="tablist" aria-label="Terminal sessions">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === activeTabId}
            className={`${classes.terminalSessionTab} ${tab.id === activeTabId ? classes.terminalSessionTabActive : ''}`}
            onClick={() => actions.setActiveTabId(tab.id)}
          >
            <TerminalTabLabel
              title={tab.title}
              closable={tabs.length > 1}
              onClose={() => actions.removeTab(tab.id)}
            />
          </button>
        ))}
        <ActionIcon
          variant="subtle"
          size="sm"
          aria-label="New terminal tab"
          onClick={actions.addTab}
          className={classes.terminalTabAdd}
        >
          <IconPlus size={14} />
        </ActionIcon>
      </div>

      <div className={classes.terminalTabPanel} role="tabpanel">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`${classes.terminalTabPane} ${tab.id === activeTabId ? '' : classes.terminalTabPaneHidden}`}
          >
            <XTermView
              tabId={tab.id}
              serverId={tab.serverId}
              isConnected={isTabConnected(tab.serverId)}
              initialCwd={tab.initialCwd}
              isActive={tab.id === activeTabId}
              onReady={actions.registerTerminalId}
              onClosed={actions.unregisterTerminalId}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
