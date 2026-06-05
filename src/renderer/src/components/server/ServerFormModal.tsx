import {
  Button,
  Group,
  Modal,
  NumberInput,
  PasswordInput,
  SegmentedControl,
  Stack,
  TextInput,
  Textarea,
} from '@mantine/core'
import { useServerFormModal } from '../../hooks/useServerFormModal'
import type { Server } from '../../types'

interface ServerFormModalProps {
  opened: boolean
  onClose: () => void
  editingServer?: Server | null
}

export function ServerFormModal({ opened, onClose, editingServer = null }: ServerFormModalProps) {
  const { form, title, actions } = useServerFormModal({ opened, editingServer, onClose })

  return (
    <Modal opened={opened} onClose={onClose} title={title} size="md" centered>
      <Stack gap="md">
        <TextInput
          label="Name"
          placeholder="Production"
          value={form.name}
          onChange={(event) => actions.updateField('name', event.currentTarget.value)}
        />
        <Group grow>
          <TextInput
            label="Host"
            placeholder="192.168.1.1"
            value={form.host}
            onChange={(event) => actions.updateField('host', event.currentTarget.value)}
          />
          <NumberInput
            label="Port"
            min={1}
            max={65535}
            value={form.port}
            onChange={(value) => actions.updateField('port', Number(value) || 22)}
          />
        </Group>
        <TextInput
          label="Username"
          placeholder="deploy"
          value={form.username}
          onChange={(event) => actions.updateField('username', event.currentTarget.value)}
        />
        <SegmentedControl
          fullWidth
          data={[
            { label: 'Password', value: 'password' },
            { label: 'Private Key', value: 'private_key' },
          ]}
          value={form.authType}
          onChange={(value) => actions.setAuthType(value as typeof form.authType)}
        />
        {form.authType === 'password' ? (
          <PasswordInput
            label="Password"
            placeholder="••••••••"
            value={form.password}
            onChange={(event) => actions.updateField('password', event.currentTarget.value)}
          />
        ) : (
          <Textarea
            label="Private Key"
            placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
            minRows={3}
            styles={{ input: { fontFamily: 'monospace', fontSize: 12 } }}
            value={form.privateKey}
            onChange={(event) => actions.updateField('privateKey', event.currentTarget.value)}
          />
        )}
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="light" onClick={() => void actions.test()}>
            Test Connection
          </Button>
          <Button onClick={actions.save}>Save</Button>
        </Group>
      </Stack>
    </Modal>
  )
}
