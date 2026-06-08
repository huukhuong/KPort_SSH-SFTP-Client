import {
  FILE_SEARCH_DEFAULT_MAX_RESULTS,
  FILE_SEARCH_TIMEOUT_MS,
  type FileSearchInput,
  type FileSearchResult,
} from '../../shared/productivity'
import { connectionManager } from './connection-manager'
import { shellEscape } from './shell'

function parseSearchOutput(output: string): FileSearchResult[] {
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((path) => ({
      path,
      name: path.split('/').filter(Boolean).pop() ?? path,
    }))
}

export async function searchRemoteFiles(input: FileSearchInput): Promise<FileSearchResult[]> {
  const maxResults = input.maxResults ?? FILE_SEARCH_DEFAULT_MAX_RESULTS
  const rootPath = input.path.trim() || '/'
  const query = input.query.trim()

  if (!query) {
    return []
  }

  const command = `find ${shellEscape(rootPath)} -name ${shellEscape(`*${query}*`)} -type f 2>/dev/null | head -n ${maxResults}`

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Search timed out')), FILE_SEARCH_TIMEOUT_MS)
  })

  const output = await Promise.race([connectionManager.exec(input.serverId, command), timeout])
  return parseSearchOutput(output)
}
