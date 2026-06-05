import type { TransferJob } from '../types'

export const mockTransfers: TransferJob[] = [
  {
    id: 't1',
    direction: 'upload',
    localPath: '/Users/dev/deploy.zip',
    remotePath: '/var/www/api/deploy.zip',
    status: 'active',
    progress: 62,
  },
  {
    id: 't2',
    direction: 'download',
    localPath: '/Users/dev/logs/app.log',
    remotePath: '/var/log/app.log',
    status: 'active',
    progress: 34,
  },
  {
    id: 't4',
    direction: 'download',
    localPath: '/Users/dev/logs/nginx.log',
    remotePath: '/var/log/nginx/access.log',
    status: 'completed',
    progress: 100,
  },
  {
    id: 't3',
    direction: 'upload',
    localPath: '/Users/dev/config.yml',
    remotePath: '/etc/app/config.yml',
    status: 'failed',
    progress: 18,
    error: 'Permission denied',
  },
]
