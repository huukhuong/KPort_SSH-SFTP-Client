import { Button, Group, Loader, Modal, Stack, Text, TextInput } from '@mantine/core'
import { useState } from 'react'
import type { FileSearchResult } from '../../../../shared/productivity'
import { searchRemoteFiles } from '../../services/search'

interface RemoteSearchModalProps {
  opened: boolean
  serverId: string | null
  defaultPath: string
  onClose: () => void
  onOpenResult: (path: string) => void
}

export function RemoteSearchModal({
  opened,
  serverId,
  defaultPath,
  onClose,
  onOpenResult,
}: RemoteSearchModalProps) {
  const [query, setQuery] = useState('')
  const [path, setPath] = useState(defaultPath)
  const [results, setResults] = useState<FileSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!serverId || !query.trim()) return

    setSearching(true)
    setError(null)

    try {
      const items = await searchRemoteFiles({
        serverId,
        path: path.trim() || '/',
        query: query.trim(),
      })
      setResults(items)
    } catch (searchError) {
      setResults([])
      setError(searchError instanceof Error ? searchError.message : 'Search failed')
    } finally {
      setSearching(false)
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Search remote files" size="lg">
      <Stack gap="sm">
        <TextInput
          label="Search under"
          value={path}
          onChange={(event) => setPath(event.currentTarget.value)}
        />
        <TextInput
          label="Filename contains"
          placeholder="nginx.conf"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              void handleSearch()
            }
          }}
        />
        <Group justify="flex-end">
          <Button onClick={() => void handleSearch()} disabled={!serverId || !query.trim() || searching}>
            Search
          </Button>
        </Group>

        {searching && (
          <Group justify="center" py="md">
            <Loader size="sm" />
          </Group>
        )}

        {error && (
          <Text size="sm" c="red">
            {error}
          </Text>
        )}

        {!searching && results.length === 0 && query.trim() && !error && (
          <Text size="sm" c="dimmed">
            No files found.
          </Text>
        )}

        {results.map((result) => (
          <Button
            key={result.path}
            variant="light"
            justify="flex-start"
            onClick={() => {
              onOpenResult(result.path)
              onClose()
            }}
          >
            <Stack gap={0} align="flex-start">
              <Text size="sm">{result.name}</Text>
              <Text size="xs" c="dimmed">
                {result.path}
              </Text>
            </Stack>
          </Button>
        ))}
      </Stack>
    </Modal>
  )
}
