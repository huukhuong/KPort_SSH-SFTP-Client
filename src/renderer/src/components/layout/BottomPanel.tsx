import { ActionIcon, Group, Tabs } from '@mantine/core'
import { IconChevronDown, IconChevronUp, IconList, IconTerminal2 } from '@tabler/icons-react'
import { TerminalPanel } from '../terminal/TerminalPanel'
import { TransferQueuePanel } from '../transfer/TransferQueuePanel'
import classes from '../../styles/layout.module.css'

interface BottomPanelProps {
  onToggle: () => void
  collapsed?: boolean
}

export function BottomPanel({ onToggle, collapsed = false }: BottomPanelProps) {
  return (
    <div className={classes.bottomPanel}>
      <Tabs
        defaultValue="terminal"
        variant="unstyled"
        styles={{
          root: { display: 'flex', flexDirection: 'column', height: '100%' },
          panel: { flex: 1, minHeight: 0 },
        }}
      >
        <Group
          className={`${classes.panelHeader} ${classes.panelHeaderAccentTerminal}`}
          justify="space-between"
          wrap="nowrap"
        >
          <Tabs.List style={{ gap: 4, border: 'none' }}>
            <Tabs.Tab
              value="terminal"
              leftSection={<IconTerminal2 size={14} />}
              style={{ height: 28, paddingInline: 10, borderRadius: 6 }}
            >
              Terminal
            </Tabs.Tab>
            <Tabs.Tab
              value="transfers"
              leftSection={<IconList size={14} />}
              style={{ height: 28, paddingInline: 10, borderRadius: 6 }}
            >
              Transfers
            </Tabs.Tab>
          </Tabs.List>

          <ActionIcon variant="subtle" size="sm" onClick={onToggle} aria-label="Toggle panel">
            {collapsed ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
          </ActionIcon>
        </Group>

        {!collapsed && (
          <>
            <Tabs.Panel value="terminal" className={classes.panelBody}>
              <TerminalPanel />
            </Tabs.Panel>
            <Tabs.Panel value="transfers" className={classes.panelBody}>
              <TransferQueuePanel />
            </Tabs.Panel>
          </>
        )}
      </Tabs>
    </div>
  )
}
