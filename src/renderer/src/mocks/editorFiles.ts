import type { EditorTab } from '../types'
import { getLanguageForPath } from '../utils/editorLanguage'

const envContent = `NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://localhost:5432/app
REDIS_URL=redis://localhost:6379
JWT_SECRET=********`

const nginxContent = `server {
    listen 80;
    root /var/www/api/public;
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
}`

const composeContent = `services:
  api:
    image: api:latest
    ports:
      - "3000:3000"
    restart: unless-stopped`

export const mockEditorTabs: EditorTab[] = [
  {
    id: 'env',
    path: '/var/www/api/.env',
    side: 'remote',
    serverId: 'mock-server',
    language: 'ini',
    content: envContent,
    savedContent: envContent,
    isDirty: true,
    status: 'ready',
  },
  {
    id: 'nginx',
    path: '/etc/nginx/nginx.conf',
    side: 'remote',
    serverId: 'mock-server',
    language: 'nginx',
    content: nginxContent,
    savedContent: nginxContent,
    isDirty: false,
    status: 'ready',
  },
  {
    id: 'compose',
    path: '/var/www/api/docker-compose.yml',
    side: 'remote',
    serverId: 'mock-server',
    language: 'yaml',
    content: composeContent,
    savedContent: composeContent,
    isDirty: false,
    status: 'ready',
  },
]

export const mockFileContents: Record<string, { content: string; language: string }> = {
  '/var/www/api/.env': {
    language: 'ini',
    content: envContent,
  },
  '/etc/nginx/nginx.conf': {
    language: 'nginx',
    content: nginxContent,
  },
  '/var/www/api/docker-compose.yml': {
    language: 'yaml',
    content: composeContent,
  },
  '/var/log/app.log': {
    language: 'plaintext',
    content: `2026-06-05T10:00:01Z INFO  Server started on :3000
2026-06-05T10:00:02Z INFO  Connected to database
2026-06-05T10:15:44Z WARN  Slow query detected (420ms)
2026-06-05T10:22:10Z INFO  Health check OK`,
  },
  '/Users/dev/.env.local': {
    language: 'ini',
    content: `NODE_ENV=development
PORT=5173`,
  },
  '/Users/dev/projects/kport/package.json': {
    language: 'json',
    content: `{
  "name": "kport",
  "version": "0.1.0",
  "private": true
}`,
  },
}

export function getMockFileContent(path: string): { content: string; language: string } {
  const known = mockFileContents[path]
  if (known) return known

  return {
    language: getLanguageForPath(path),
    content: `# Mock file: ${path}\n# Edit me for the demo.`,
  }
}
