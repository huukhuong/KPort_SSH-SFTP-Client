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
import { notifications } from '@mantine/notifications'
import { useEffect, useState } from 'react'
import { useServerStore, type ServerFormValues } from '../../stores/serverStore'
import type { AuthType, Server } from '../../types'

interface ServerFormModalProps {
  opened: boolean
  onClose: () => void
  editingServer?: Server | null
}

const EMPTY_FORM: ServerFormValues = {
  name: '',
  host: '',
  port: 22,
  username: '',
  authType: 'password',
  password: '',
  privateKey: '',
}

export function ServerFormModal({ opened, onClose, editingServer = null }: ServerFormModalProps) {
  const addServer = useServerStore((state) => state.addServer)
  const updateServer = useServerStore((state) => state.updateServer)
  const testConnection = useServerStore((state) => state.testConnection)
  const [form, setForm] = useState<ServerFormValues>(EMPTY_FORM)

  useEffect(() => {
    if (!opened) return

    if (editingServer) {
      setForm({
        name: editingServer.name,
        host: editingServer.host,
        port: editingServer.port,
        username: editingServer.username,
        authType: editingServer.authType,
        password: '',
        privateKey: '',
      })
      return
    }

    setForm(EMPTY_FORM)
  }, [opened, editingServer])

  const updateField = <K extends keyof ServerFormValues>(key: K, value: ServerFormValues[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const validate = (): boolean => {
    if (!form.name.trim() || !form.host.trim() || !form.username.trim()) {
      notifications.show({
        title: 'Missing fields',
        message: 'Name, host, and username are required',
        color: 'red',
      })
      return false
    }

    return true
  }

  const handleSave = () => {
    if (!validate()) return

    if (editingServer) {
      updateServer(editingServer.id, form)
      notifications.show({
        title: 'Server updated',
        message: editingServer.name,
        color: 'green',
      })
    } else {
      addServer(form)
      notifications.show({
        title: 'Server added',
        message: form.name,
        color: 'green',
      })
    }

    onClose()
  }

  const handleTest = async () => {
    if (!validate()) return

    const ok = await testConnection(form)
    notifications.show({
      title: ok ? 'Connection successful' : 'Connection failed',
      message: ok
        ? `${form.username}@${form.host}:${form.port}`
        : 'Check host and credentials',
      color: ok ? 'green' : 'red',
    })
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={editingServer ? 'Edit Server' : 'Add Server'}
      size="md"
      centered
    >
      <Stack gap="md">
        <TextInput
          label="Name"
          placeholder="Production"
          value={form.name}
          onChange={(event) => updateField('name', event.currentTarget.value)}
        />
        <Group grow>
          <TextInput
            label="Host"
            placeholder="192.168.1.1"
            value={form.host}
            onChange={(event) => updateField('host', event.currentTarget.value)}
          />
          <NumberInput
            label="Port"
            min={1}
            max={65535}
            value={form.port}
            onChange={(value) => updateField('port', Number(value) || 22)}
          />
        </Group>
        <TextInput
          label="Username"
          placeholder="deploy"
          value={form.username}
          onChange={(event) => updateField('username', event.currentTarget.value)}
        />
        <SegmentedControl
          fullWidth
          data={[
            { label: 'Password', value: 'password' },
            { label: 'Private Key', value: 'private_key' },
          ]}
          value={form.authType}
          onChange={(value) => updateField('authType', value as AuthType)}
        />
        {form.authType === 'password' ? (
          <PasswordInput
            label="Password"
            placeholder="••••••••"
            value={form.password}
            onChange={(event) => updateField('password', event.currentTarget.value)}
          />
        ) : (
          <Textarea
            label="Private Key"
            placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
            minRows={3}
            styles={{ input: { fontFamily: 'monospace', fontSize: 12 } }}
            value={form.privateKey}
            onChange={(event) => updateField('privateKey', event.currentTarget.value)}
          />
        )}
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="light" onClick={() => void handleTest()}>
            Test Connection
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </Group>
      </Stack>
    </Modal>
  )
}
