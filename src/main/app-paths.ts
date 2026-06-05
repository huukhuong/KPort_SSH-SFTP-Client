import { app, nativeImage, type NativeImage } from 'electron'
import { existsSync, readFileSync } from 'fs'
import { join, resolve } from 'path'

function getResourcesDirCandidates(): string[] {
  if (app.isPackaged) {
    return [
      join(process.resourcesPath, 'resources'),
      process.resourcesPath,
    ]
  }

  return [
    join(app.getAppPath(), 'resources'),
    join(__dirname, '../../resources'),
    join(__dirname, '../resources'),
    join(process.cwd(), 'resources'),
  ]
}

function getIconFileCandidates(): string[] {
  if (process.platform === 'win32') {
    return ['icon.ico', 'icon.png']
  }

  if (process.platform === 'darwin') {
    return ['icon.png', 'icon.icns']
  }

  return ['icon.png']
}

export function resolveAppIconPath(): string | null {
  const seen = new Set<string>()

  for (const base of getResourcesDirCandidates()) {
    const resolvedBase = resolve(base)
    if (seen.has(resolvedBase) || !existsSync(resolvedBase)) continue
    seen.add(resolvedBase)

    for (const name of getIconFileCandidates()) {
      const iconPath = resolve(resolvedBase, name)
      if (existsSync(iconPath)) {
        return iconPath
      }
    }
  }

  return null
}

function loadNativeImage(iconPath: string): NativeImage | null {
  if (iconPath.endsWith('.png')) {
    try {
      const image = nativeImage.createFromBuffer(readFileSync(iconPath))
      if (!image.isEmpty()) return image
    } catch {
      // fall through to createFromPath
    }
  }

  const image = nativeImage.createFromPath(iconPath)
  return image.isEmpty() ? null : image
}

export function loadAppIcon(): { path: string; image: NativeImage } | null {
  const iconPath = resolveAppIconPath()
  if (!iconPath) return null

  const image = loadNativeImage(iconPath)
  if (!image) return null

  return { path: iconPath, image }
}
