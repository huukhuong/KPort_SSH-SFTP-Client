import { ActionIcon, Group, Tabs, Text } from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import { PanelHeader } from '../layout/PanelHeader'
import classes from '../../styles/layout.module.css'

export function EditorPanel() {
  return (
    <div className={classes.editorArea}>
      <PanelHeader title="Editor" accent="editor" />

      <Tabs
        defaultValue="env"
        variant="outline"
        styles={{
          root: { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 },
          panel: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' },
          list: { flexWrap: 'nowrap', overflow: 'hidden' },
        }}
      >
        <Tabs.List px="xs" className={classes.editorTabBar}>
          <EditorTab value="env" label=".env" dirty />
          <EditorTab value="nginx" label="nginx.conf" />
          <EditorTab value="compose" label="docker-compose.yml" />
        </Tabs.List>

        <Tabs.Panel value="env">
          <EditorContent
            lines={['1', '2', '3', '4', '5', '6']}
            code={`NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://localhost:5432/app
REDIS_URL=redis://localhost:6379
JWT_SECRET=********`}
          />
        </Tabs.Panel>

        <Tabs.Panel value="nginx">
          <EditorContent
            lines={['1', '2', '3', '4']}
            code={`server {
    listen 80;
    root /var/www/api/public;
}`}
          />
        </Tabs.Panel>

        <Tabs.Panel value="compose">
          <EditorContent
            lines={['1', '2', '3']}
            code={`services:
  api:
    image: api:latest`}
          />
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}

function EditorTab({
  value,
  label,
  dirty = false,
}: {
  value: string
  label: string
  dirty?: boolean
}) {
  return (
    <Tabs.Tab value={value} style={{ paddingInline: 10 }}>
      <Group gap={6} wrap="nowrap">
        <Text size="xs">{dirty ? `${label} *` : label}</Text>
        <ActionIcon component="span" variant="transparent" size="xs" aria-label={`Close ${label}`}>
          <IconX size={12} />
        </ActionIcon>
      </Group>
    </Tabs.Tab>
  )
}

function EditorContent({ lines, code }: { lines: string[]; code: string }) {
  return (
    <div className={classes.editorContent}>
      <div className={classes.lineNumbers}>
        {lines.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
      <div className={classes.codeArea}>{code}</div>
    </div>
  )
}
