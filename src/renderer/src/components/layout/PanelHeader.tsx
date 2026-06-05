import { Group, Text } from '@mantine/core'
import type { ReactNode } from 'react'
import classes from '../../styles/layout.module.css'

export type PanelAccent = 'local' | 'remote' | 'editor' | 'terminal' | 'default'

interface PanelHeaderProps {
  title: string
  actions?: ReactNode
  accent?: PanelAccent
}

const accentClass: Record<PanelAccent, string> = {
  local: classes.panelHeaderAccentLocal,
  remote: classes.panelHeaderAccentRemote,
  editor: classes.panelHeaderAccentEditor,
  terminal: classes.panelHeaderAccentTerminal,
  default: '',
}

export function PanelHeader({ title, actions, accent = 'default' }: PanelHeaderProps) {
  return (
    <div className={[classes.panelHeader, accentClass[accent]].filter(Boolean).join(' ')}>
      <Text size="xs" fw={700} tt="uppercase" className={classes.panelHeaderTitle}>
        {title}
      </Text>
      {actions && <Group gap={4}>{actions}</Group>}
    </div>
  )
}
