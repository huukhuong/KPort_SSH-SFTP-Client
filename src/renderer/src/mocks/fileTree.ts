import type { FileEntry } from '../types'

export const mockLocalFiles: FileEntry[] = [
  { name: 'projects', path: '/Users/dev/projects', type: 'directory' },
  { name: 'deploy.zip', path: '/Users/dev/deploy.zip', type: 'file', size: 2048000, modifiedAt: '2026-06-01' },
  { name: '.env.local', path: '/Users/dev/.env.local', type: 'file', size: 512, modifiedAt: '2026-05-28' },
]

export const mockRemoteFiles: FileEntry[] = [
  { name: 'var', path: '/var', type: 'directory' },
  { name: 'www', path: '/var/www', type: 'directory' },
  { name: 'nginx.conf', path: '/etc/nginx/nginx.conf', type: 'file', size: 4096, modifiedAt: '2026-05-30' },
  { name: 'docker-compose.yml', path: '/var/www/api/docker-compose.yml', type: 'file', size: 1024, modifiedAt: '2026-06-02' },
]
