import { ActionIcon, Button, Center, Group, Loader, Tabs, Text } from '@mantine/core'
import Editor from '@monaco-editor/react'
import { IconDeviceFloppy, IconX } from '@tabler/icons-react'
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
      <PanelHeader
        title="Editor"
        accent="editor"
        actions={
          activeTab?.status === 'ready' ? (
            <Button
              size="compact-xs"
              variant="light"
              leftSection={<IconDeviceFloppy size={14} />}
              loading={activeTab.saving}
              disabled={!activeTab.isDirty}
              onClick={() => void actions.saveActiveTab()}
            >
              Save
            </Button>
          ) : undefined
        }
      />

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
                  {tab.status === 'loading' && '… '}
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
              {tab.status === 'loading' && (
                <Center h="100%">
                  <Loader size="sm" />
                </Center>
              )}
              {tab.status === 'error' && (
                <Center h="100%" px="md">
                  <Text size="sm" c="red" ta="center">
                    {tab.error ?? 'Failed to open file'}
                  </Text>
                </Center>
              )}
              {tab.status === 'ready' && (
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
              )}
            </div>
          </Tabs.Panel>
        ))}
      </Tabs>
    </>
  )
}
