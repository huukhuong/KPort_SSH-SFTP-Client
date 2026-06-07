import { mkdir, rename, rm, writeFile } from 'fs/promises'
import { join, resolve } from 'path'

export async function mkdirLocalDirectory(parentPath: string, name: string): Promise<string> {
  const parent = resolve(parentPath)
  const target = resolve(join(parent, name))
  await mkdir(target)
  return target
}

export async function renameLocalEntry(fromPath: string, toPath: string): Promise<void> {
  await rename(resolve(fromPath), resolve(toPath))
}

export async function createLocalFile(parentPath: string, name: string): Promise<string> {
  const parent = resolve(parentPath)
  const target = resolve(join(parent, name))
  await writeFile(target, '', 'utf8')
  return target
}

export async function deleteLocalEntry(
  targetPath: string,
  type: 'file' | 'directory',
): Promise<void> {
  const resolved = resolve(targetPath)

  await rm(resolved, {
    recursive: type === 'directory',
    force: type === 'directory',
  })
}
