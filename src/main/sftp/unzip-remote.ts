import type { RemoteUnzipResult } from '../../shared/sftp'
import { connectionManager } from '../ssh/connection-manager'
import { shellEscape } from '../ssh/shell'
import { directoryListingCache } from './directory-cache'
import { getRemoteParent } from './paths'

const INSTALL_UNZIP_SCRIPT = `
if command -v unzip >/dev/null 2>&1; then
  exit 0
fi
if command -v apt-get >/dev/null 2>&1; then
  if apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq unzip; then exit 0; fi
  if sudo -n apt-get update -qq && DEBIAN_FRONTEND=noninteractive sudo -n apt-get install -y -qq unzip; then exit 0; fi
fi
if command -v apk >/dev/null 2>&1; then
  if apk add --no-cache unzip; then exit 0; fi
fi
if command -v dnf >/dev/null 2>&1; then
  if dnf install -y unzip; then exit 0; fi
  if sudo -n dnf install -y unzip; then exit 0; fi
fi
if command -v yum >/dev/null 2>&1; then
  if yum install -y unzip; then exit 0; fi
  if sudo -n yum install -y unzip; then exit 0; fi
fi
if command -v pacman >/dev/null 2>&1; then
  pacman -Sy --noconfirm unzip && exit 0
fi
if command -v zypper >/dev/null 2>&1; then
  zypper --non-interactive install unzip && exit 0
fi
exit 1
`.trim()

async function hasUnzipCommand(serverId: string): Promise<boolean> {
  try {
    await connectionManager.exec(serverId, 'command -v unzip >/dev/null 2>&1')
    return true
  } catch {
    return false
  }
}

async function installUnzipPackage(serverId: string): Promise<void> {
  try {
    await connectionManager.exec(serverId, INSTALL_UNZIP_SCRIPT)
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Install failed'
    throw new Error(
      `unzip is not installed and could not be installed automatically (${detail}). Install unzip on the server or connect as a user with package manager access.`,
    )
  }

  if (!(await hasUnzipCommand(serverId))) {
    throw new Error(
      'unzip is still unavailable after install attempt. Install it manually on the server.',
    )
  }
}

export async function unzipRemoteArchive(
  serverId: string,
  zipPath: string,
): Promise<RemoteUnzipResult> {
  const normalizedZip = zipPath.trim()
  if (!/\.zip$/i.test(normalizedZip)) {
    throw new Error('Remote path is not a .zip file')
  }

  const extractPath = normalizedZip.replace(/\.zip$/i, '')
  const hadUnzip = await hasUnzipCommand(serverId)

  if (!hadUnzip) {
    await installUnzipPackage(serverId)
  }

  const zipEsc = shellEscape(normalizedZip)
  const destEsc = shellEscape(extractPath)

  await connectionManager.exec(
    serverId,
    `mkdir -p ${destEsc} && unzip -o ${zipEsc} -d ${destEsc}`,
  )

  const parentPath = getRemoteParent(normalizedZip)
  directoryListingCache.invalidate(serverId, parentPath)
  directoryListingCache.invalidate(serverId, extractPath)

  return {
    zipPath: normalizedZip,
    extractPath,
    installedUnzip: !hadUnzip,
  }
}
