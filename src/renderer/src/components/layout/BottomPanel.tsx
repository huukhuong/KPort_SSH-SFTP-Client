import { ActionIcon } from '@mantine/core'
import { IconChevronDown, IconChevronUp, IconList, IconTerminal2 } from '@tabler/icons-react'
import { useState } from 'react'
import { TerminalPanel } from '../terminal/TerminalPanel'
import { TransferQueuePanel } from '../transfer/TransferQueuePanel'
import classes from '../../styles/layout.module.css'

type BottomTab = 'terminal' | 'transfers'

interface BottomPanelProps {
  onToggle: () => void
  collapsed?: boolean
}

export function BottomPanel({ onToggle, collapsed = false }: BottomPanelProps) {
  const [activeTab, setActiveTab] = useState<BottomTab>('terminal')

  return (
    <div
      className={`${classes.bottomPanel} ${collapsed ? classes.bottomPanelCollapsed : ''}`}
    >
      <div className={`${classes.panelHeader} ${classes.panelHeaderAccentTerminal}`}>
        <div className={classes.bottomTabBar} role="tablist" aria-label="Bottom panel">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'terminal'}
            className={`${classes.bottomTab} ${activeTab === 'terminal' ? classes.bottomTabActive : ''}`}
            onClick={() => setActiveTab('terminal')}
          >
            <IconTerminal2 size={14} />
            Terminal
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'transfers'}
            className={`${classes.bottomTab} ${activeTab === 'transfers' ? classes.bottomTabActive : ''}`}
            onClick={() => setActiveTab('transfers')}
          >
            <IconList size={14} />
            Transfers
          </button>
        </div>

        <ActionIcon variant="subtle" size="sm" onClick={onToggle} aria-label="Toggle panel">
          {collapsed ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
        </ActionIcon>
      </div>

      {!collapsed && (
        <div className={classes.panelBody}>
          {activeTab === 'terminal' ? (
            <TerminalPanel />
          ) : (
            <div className={classes.transferPanelRoot}>
              <TransferQueuePanel />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
