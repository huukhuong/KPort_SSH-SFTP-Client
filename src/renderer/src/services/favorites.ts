import type { FavoriteDirectoryInput } from '../../../shared/productivity'

function getFavoritesApi() {
  if (!window.kport?.favorites) {
    return null
  }

  return window.kport.favorites
}

export function listFavoriteDirectories(serverId?: string) {
  const api = getFavoritesApi()
  if (!api) return Promise.resolve([])
  return api.list(serverId)
}

export function addFavoriteDirectory(input: FavoriteDirectoryInput) {
  const api = getFavoritesApi()
  if (!api) {
    return Promise.reject(new Error('KPort favorites API is not available'))
  }
  return api.add(input)
}

export function removeFavoriteDirectory(id: string) {
  const api = getFavoritesApi()
  if (!api) {
    return Promise.reject(new Error('KPort favorites API is not available'))
  }
  return api.remove(id)
}
