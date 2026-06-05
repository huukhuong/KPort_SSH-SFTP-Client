import type { FavoriteDirectory } from '../types'

export const mockFavorites: FavoriteDirectory[] = [
  { id: 'f1', serverId: '1', path: '/var/www', label: '/var/www' },
  { id: 'f2', serverId: '1', path: '/etc/nginx', label: '/etc/nginx' },
  { id: 'f3', serverId: '1', path: '/var/log', label: '/var/log' },
]
