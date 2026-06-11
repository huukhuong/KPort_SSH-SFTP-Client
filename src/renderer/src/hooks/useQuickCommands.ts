import { useEffect } from 'react'
import { useQuickCommandsStore } from '../stores/quickCommandsStore'

export function useQuickCommands() {
  const commands = useQuickCommandsStore((state) => state.commands)
  const loading = useQuickCommandsStore((state) => state.loading)
  const load = useQuickCommandsStore((state) => state.load)
  const addCommand = useQuickCommandsStore((state) => state.add)
  const removeCommand = useQuickCommandsStore((state) => state.remove)

  useEffect(() => {
    void load()
  }, [load])

  return {
    commands,
    loading,
    addCommand,
    removeCommand,
    refresh: load,
  }
}
