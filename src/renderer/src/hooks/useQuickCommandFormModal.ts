import { notifications } from '@mantine/notifications'
import { useCallback, useEffect, useState } from 'react'
import type { QuickCommandRecord } from '../../../shared/productivity'
import { useQuickCommandsStore } from '../stores/quickCommandsStore'

interface QuickCommandFormValues {
  label: string
  command: string
  group: string
}

const EMPTY_FORM: QuickCommandFormValues = {
  label: '',
  command: '',
  group: '',
}

interface UseQuickCommandFormModalOptions {
  opened: boolean
  editingCommand?: QuickCommandRecord | null
  onClose: () => void
}

export function useQuickCommandFormModal({
  opened,
  editingCommand = null,
  onClose,
}: UseQuickCommandFormModalOptions) {
  const addCommand = useQuickCommandsStore((state) => state.add)
  const updateCommand = useQuickCommandsStore((state) => state.update)
  const [form, setForm] = useState<QuickCommandFormValues>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!opened) return

    if (editingCommand) {
      setForm({
        label: editingCommand.label,
        command: editingCommand.command,
        group: editingCommand.group ?? '',
      })
      return
    }

    setForm(EMPTY_FORM)
  }, [editingCommand, opened])

  const updateField = useCallback(
    <K extends keyof QuickCommandFormValues>(key: K, value: QuickCommandFormValues[K]) => {
      setForm((current) => ({ ...current, [key]: value }))
    },
    [],
  )

  const validate = useCallback((): boolean => {
    if (!form.label.trim() || !form.command.trim()) {
      notifications.show({
        title: 'Missing fields',
        message: 'Label and command are required',
        color: 'red',
      })
      return false
    }

    return true
  }, [form.command, form.label])

  const save = useCallback(async () => {
    if (!validate() || saving) return

    const payload = {
      label: form.label.trim(),
      command: form.command.trim(),
      group: form.group.trim() || undefined,
    }

    setSaving(true)
    try {
      if (editingCommand) {
        await updateCommand(editingCommand.id, payload)
      } else {
        await addCommand(payload)
      }
      onClose()
    } catch {
      // Store already surfaces the error notification.
    } finally {
      setSaving(false)
    }
  }, [
    addCommand,
    editingCommand,
    form.command,
    form.group,
    form.label,
    onClose,
    saving,
    updateCommand,
    validate,
  ])

  return {
    form,
    isEditing: Boolean(editingCommand),
    title: editingCommand ? 'Edit Quick Command' : 'Add Quick Command',
    saving,
    actions: {
      updateField,
      save,
    },
  }
}
