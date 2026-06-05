import type { EditorTab } from '../types'

export const mockEditorTabs: EditorTab[] = [
  {
    id: 'env',
    path: '/var/www/api/.env',
    language: 'ini',
    content: `NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://localhost:5432/app
REDIS_URL=redis://localhost:6379
JWT_SECRET=********`,
    isDirty: true,
  },
  {
    id: 'nginx',
    path: '/etc/nginx/nginx.conf',
    language: 'nginx',
    content: `server {
    listen 80;
    root /var/www/api/public;
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
}`,
    isDirty: false,
  },
  {
    id: 'compose',
    path: '/var/www/api/docker-compose.yml',
    language: 'yaml',
    content: `services:
  api:
    image: api:latest
    ports:
      - "3000:3000"
    restart: unless-stopped`,
    isDirty: false,
  },
]

export const mockFileContents: Record<string, { content: string; language: string }> = {
  '/var/www/api/.env': {
    language: 'ini',
    content: mockEditorTabs[0].content,
  },
  '/etc/nginx/nginx.conf': {
    language: 'nginx',
    content: mockEditorTabs[1].content,
  },
  '/var/www/api/docker-compose.yml': {
    language: 'yaml',
    content: mockEditorTabs[2].content,
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

export function getLanguageForPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()

  switch (ext) {
    case 'json':
      return 'json'
    case 'yml':
    case 'yaml':
      return 'yaml'
    case 'conf':
      return 'nginx'
    case 'env':
    case 'local':
      return 'ini'
    case 'md':
      return 'markdown'
    case 'ts':
    case 'tsx':
      return 'typescript'
    case 'js':
      return 'javascript'
    case 'log':
      return 'plaintext'
    default:
      return 'plaintext'
  }
}

export function getMockFileContent(path: string): { content: string; language: string } {
  const known = mockFileContents[path]
  if (known) return known

  return {
    language: getLanguageForPath(path),
    content: `# Mock file: ${path}\n# Edit me for the demo.`,
  }
}
