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

interface ServerFormModalProps {
  opened: boolean
  onClose: () => void
}

export function ServerFormModal({ opened, onClose }: ServerFormModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Add Server" size="md" centered>
      <Stack gap="md">
        <TextInput label="Name" placeholder="Production" />
        <Group grow>
          <TextInput label="Host" placeholder="192.168.1.1" />
          <NumberInput label="Port" placeholder="22" min={1} max={65535} />
        </Group>
        <TextInput label="Username" placeholder="deploy" />
        <SegmentedControl
          fullWidth
          data={[
            { label: 'Password', value: 'password' },
            { label: 'Private Key', value: 'key' },
          ]}
          defaultValue="password"
        />
        <PasswordInput label="Password" placeholder="••••••••" />
        <Textarea
          label="Private Key"
          placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
          minRows={3}
          styles={{ input: { fontFamily: 'monospace', fontSize: 12 } }}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="light">Test Connection</Button>
          <Button>Save</Button>
        </Group>
      </Stack>
    </Modal>
  )
}
