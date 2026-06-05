import type { Server } from '../types'

export const mockServers: Server[] = [
  {
    id: '1',
    name: 'Production',
    host: 'prod.example.com',
    port: 22,
    username: 'deploy',
    authType: 'private_key',
    isFavorite: true,
    status: 'connected',
  },
  {
    id: '2',
    name: 'Staging',
    host: 'staging.example.com',
    port: 22,
    username: 'ubuntu',
    authType: 'password',
    isFavorite: false,
    status: 'disconnected',
  },
  {
    id: '3',
    name: 'Personal VPS',
    host: 'vps.example.com',
    port: 22,
    username: 'root',
    authType: 'private_key',
    isFavorite: true,
    status: 'disconnected',
  },
]
