import type { QuickCommand } from '../types'

export const mockQuickCommands: QuickCommand[] = [
  { id: 'q1', label: 'docker ps', command: 'docker ps', group: 'Docker' },
  { id: 'q2', label: 'docker logs -f', command: 'docker logs -f api', group: 'Docker' },
  { id: 'q3', label: 'pm2 status', command: 'pm2 status', group: 'PM2' },
  { id: 'q4', label: 'nginx -t', command: 'nginx -t', group: 'Nginx' },
]
