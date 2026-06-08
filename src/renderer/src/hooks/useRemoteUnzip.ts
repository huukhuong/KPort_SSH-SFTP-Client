import { notifications } from '@mantine/notifications'
import { useCallback } from 'react'
import {
  directoryCacheScopes,
  invalidateDirectory,
} from '../services/directoryListingCache'
import { unzipRemoteArchive } from '../services/sftp'
import { useExplorerStore } from '../stores/explorerStore'
import { getFileName, getParentExplorerPath } from '../utils/fileTree'

export function useRemoteUnzip(serverId: string | null) {
  const bumpRemoteListingRefresh = useExplorerStore((state) => state.bumpRemoteListingRefresh)

  const unzip = useCallback(
    async (zipPath: string) => {
      if (!serverId) {
        notifications.show({
          title: 'Unzip unavailable',
          message: 'Connect to a server first',
          color: 'orange',
        })
        return
      }

      const fileName = getFileName(zipPath)
      const notificationId = notifications.show({
        id: `unzip-${zipPath}`,
        title: 'Unzipping',
        message: fileName,
        loading: true,
        autoClose: false,
      })

      try {
        const result = await unzipRemoteArchive(serverId, zipPath)
        const parent = getParentExplorerPath(zipPath, '/') ?? '/'

        invalidateDirectory(directoryCacheScopes.remote(serverId), parent)
        invalidateDirectory(directoryCacheScopes.remote(serverId), result.extractPath)
        bumpRemoteListingRefresh()

        notifications.update({
          id: notificationId,
          title: 'Unzip complete',
          message: result.installedUnzip
            ? `Installed unzip, extracted to ${result.extractPath}`
            : `Extracted to ${result.extractPath}`,
          color: 'green',
          loading: false,
          autoClose: 4000,
        })
      } catch (error) {
        notifications.update({
          id: notificationId,
          title: 'Unzip failed',
          message: error instanceof Error ? error.message : 'Unknown error',
          color: 'red',
          loading: false,
          autoClose: 6000,
        })
      }
    },
    [bumpRemoteListingRefresh, serverId],
  )

  return { unzip }
}
