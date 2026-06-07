import type { FavoriteDirectoryInput } from '../../../shared/productivity'

function getFavoritesApi() {
  if (!window.kport?.favorites) {
    throw new Error('KPort favorites API is not available')
  }

  return window.kport.favorites
}

export function listFavoriteDirectories(serverId?: string) {
  return getFavoritesApi().list(serverId)
}

export function addFavoriteDirectory(input: FavoriteDirectoryInput) {
  return getFavoritesApi().add(input)
}

export function removeFavoriteDirectory(id: string) {
  return getFavoritesApi().remove(id)
}
