import { Button, Group, Modal, Stack, TextInput } from '@mantine/core'
import { useQuickCommandFormModal } from '../../hooks/useQuickCommandFormModal'
import type { QuickCommandRecord } from '../../../../shared/productivity'

interface QuickCommandFormModalProps {
  opened: boolean
  onClose: () => void
  editingCommand?: QuickCommandRecord | null
}

export function QuickCommandFormModal({
  opened,
  onClose,
  editingCommand = null,
}: QuickCommandFormModalProps) {
  const { form, title, saving, actions } = useQuickCommandFormModal({
    opened,
    editingCommand,
    onClose,
  })

  return (
    <Modal opened={opened} onClose={onClose} title={title} size="md" centered>
      <Stack gap="md">
        <TextInput
          label="Label"
          placeholder="docker ps"
          value={form.label}
          onChange={(event) => actions.updateField('label', event.currentTarget.value)}
        />
        <TextInput
          label="Command"
          placeholder="docker ps -a"
          value={form.command}
          onChange={(event) => actions.updateField('command', event.currentTarget.value)}
          styles={{ input: { fontFamily: 'monospace', fontSize: 12 } }}
        />
        <TextInput
          label="Group"
          placeholder="Docker"
          value={form.group}
          onChange={(event) => actions.updateField('group', event.currentTarget.value)}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={() => void actions.save()}>
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
