import { notifications } from '@mantine/notifications'
import { useCallback, useEffect, useState } from 'react'
import { useServerStore, type ServerFormValues } from '../stores/serverStore'
import type { AuthType, Server } from '../types'

const EMPTY_FORM: ServerFormValues = {
  name: '',
  host: '',
  port: 22,
  username: '',
  authType: 'password',
  password: '',
  privateKey: '',
}

interface UseServerFormModalOptions {
  opened: boolean
  editingServer?: Server | null
  onClose: () => void
}

export function useServerFormModal({
  opened,
  editingServer = null,
  onClose,
}: UseServerFormModalOptions) {
  const addServer = useServerStore((state) => state.addServer)
  const updateServer = useServerStore((state) => state.updateServer)
  const testConnection = useServerStore((state) => state.testConnection)
  const [form, setForm] = useState<ServerFormValues>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

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

  const updateField = useCallback(
    <K extends keyof ServerFormValues>(key: K, value: ServerFormValues[K]) => {
      setForm((current) => ({ ...current, [key]: value }))
    },
    [],
  )

  const setAuthType = useCallback((authType: AuthType) => {
    setForm((current) => ({ ...current, authType }))
  }, [])

  const validate = useCallback((): boolean => {
    if (!form.name.trim() || !form.host.trim() || !form.username.trim()) {
      notifications.show({
        title: 'Missing fields',
        message: 'Name, host, and username are required',
        color: 'red',
      })
      return false
    }

    return true
  }, [form.host, form.name, form.username])

  const save = useCallback(async () => {
    if (!validate() || saving) return

    setSaving(true)
    try {
      if (editingServer) {
        await updateServer(editingServer.id, form)
        notifications.show({
          title: 'Server updated',
          message: editingServer.name,
          color: 'green',
        })
      } else {
        await addServer(form)
        notifications.show({
          title: 'Server added',
          message: form.name,
          color: 'green',
        })
      }

      onClose()
    } catch (err) {
      notifications.show({
        title: 'Save failed',
        message: err instanceof Error ? err.message : 'Could not save server',
        color: 'red',
      })
    } finally {
      setSaving(false)
    }
  }, [addServer, editingServer, form, onClose, saving, updateServer, validate])

  const test = useCallback(async () => {
    if (!validate() || testing) return

    setTesting(true)
    try {
      const ok = await testConnection(form)
      notifications.show({
        title: ok ? 'Connection successful' : 'Connection failed',
        message: ok
          ? `${form.username}@${form.host}:${form.port}`
          : 'Check host and credentials',
        color: ok ? 'green' : 'red',
      })
    } catch (err) {
      notifications.show({
        title: 'Connection failed',
        message: err instanceof Error ? err.message : 'Could not reach server',
        color: 'red',
      })
    } finally {
      setTesting(false)
    }
  }, [form, testConnection, testing, validate])

  return {
    form,
    isEditing: Boolean(editingServer),
    title: editingServer ? 'Edit Server' : 'Add Server',
    saving,
    testing,
    actions: {
      updateField,
      setAuthType,
      save,
      test,
    },
  }
}
