import { useCallback } from 'react'
import { getPathForDroppedFile } from '../services/dialog'

interface UseExplorerDropUploadOptions {
  enabled: boolean
  onUploadPaths: (paths: string[]) => void | Promise<void>
}

export function useExplorerDropUpload({ enabled, onUploadPaths }: UseExplorerDropUploadOptions) {
  const onDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (!enabled) return
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
    },
    [enabled],
  )

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (!enabled) return
      event.preventDefault()

      const paths = Array.from(event.dataTransfer.files)
        .map((file) => {
          try {
            return getPathForDroppedFile(file)
          } catch {
            return null
          }
        })
        .filter((path): path is string => Boolean(path))

      if (paths.length === 0) return
      void onUploadPaths(paths)
    },
    [enabled, onUploadPaths],
  )

  return { onDragOver, onDrop }
}
