import type { FileSearchInput } from '../../../shared/productivity'

function getSearchApi() {
  if (!window.kport?.search) {
    throw new Error('KPort search API is not available')
  }

  return window.kport.search
}

export function searchRemoteFiles(input: FileSearchInput) {
  return getSearchApi().files(input)
}
