import { Button, Group, Modal, TextInput } from '@mantine/core'
import { useEffect, useState } from 'react'

interface ExplorerNameModalProps {
  opened: boolean
  title: string
  label: string
  initialName?: string
  saving?: boolean
  onClose: () => void
  onSubmit: (name: string) => void
}

export function ExplorerNameModal({
  opened,
  title,
  label,
  initialName = '',
  saving = false,
  onClose,
  onSubmit,
}: ExplorerNameModalProps) {
  const [name, setName] = useState(initialName)

  useEffect(() => {
    if (opened) {
      setName(initialName)
    }
  }, [opened, initialName])

  const handleSubmit = () => {
    onSubmit(name)
  }

  return (
    <Modal opened={opened} onClose={onClose} title={title} size="sm" centered>
      <TextInput
        label={label}
        value={name}
        onChange={(event) => setName(event.currentTarget.value)}
        data-autofocus
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            handleSubmit()
          }
        }}
      />
      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={saving}>
          Save
        </Button>
      </Group>
    </Modal>
  )
}
