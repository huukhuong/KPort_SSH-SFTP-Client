import { ActionIcon, Group, Tabs, Text } from '@mantine/core'
import Editor from '@monaco-editor/react'
import { IconX } from '@tabler/icons-react'
import { useEditorPanel } from '../../hooks/useEditorPanel'
import { PanelHeader } from '../layout/PanelHeader'
import classes from '../../styles/layout.module.css'

const MONACO_OPTIONS = {
  minimap: { enabled: false },
  fontSize: 13,
  lineHeight: 22,
  scrollBeyondLastLine: false,
  wordWrap: 'on' as const,
  padding: { top: 12, bottom: 12 },
  renderLineHighlight: 'line' as const,
  smoothScrolling: true,
}

export function EditorPanel() {
  const { tabs, activeTab, getTabLabel, actions } = useEditorPanel()

  return (
    <>
      <PanelHeader title="Editor" accent="editor" />

      <Tabs
        value={activeTab?.id}
        onChange={(value) => value && actions.setActiveTab(value)}
        variant="outline"
        styles={{
          root: { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 },
          panel: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' },
          list: { flexWrap: 'nowrap', overflow: 'hidden' },
        }}
      >
        <Tabs.List px="xs" className={classes.editorTabBar}>
          {tabs.map((tab) => (
            <Tabs.Tab key={tab.id} value={tab.id} style={{ paddingInline: 10 }}>
              <Group gap={6} wrap="nowrap">
                <Text size="xs">
                  {tab.isDirty ? `${getTabLabel(tab)} *` : getTabLabel(tab)}
                </Text>
                <ActionIcon
                  component="span"
                  variant="transparent"
                  size="xs"
                  aria-label={`Close ${getTabLabel(tab)}`}
                  onMouseDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation()
                    actions.closeTab(tab.id)
                  }}
                >
                  <IconX size={12} />
                </ActionIcon>
              </Group>
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {tabs.map((tab) => (
          <Tabs.Panel key={tab.id} value={tab.id} style={{ flex: 1, minHeight: 0 }}>
            <div className={classes.monacoHost}>
              <Editor
                height="100%"
                language={tab.language}
                value={tab.content}
                theme="vs-dark"
                options={MONACO_OPTIONS}
                onChange={(value) => {
                  if (value !== undefined) {
                    actions.updateContent(tab.id, value)
                  }
                }}
              />
            </div>
          </Tabs.Panel>
        ))}
      </Tabs>
    </>
  )
}
