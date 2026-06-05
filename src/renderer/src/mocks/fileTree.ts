import type { FileTreeNode } from '../types/fileTree'

export const FILESYSTEM_ROOT = '/'

export const LOCAL_HOME_PATH = '/Users/dev'

/** User home on the connected machine (demo default). */
export function getRemoteHomePath(username: string): string {
  return `/home/${username}`
}

const localHomeTree: FileTreeNode = {
  name: 'dev',
  path: LOCAL_HOME_PATH,
  type: 'directory',
  children: [
    {
      name: 'projects',
      path: '/Users/dev/projects',
      type: 'directory',
      children: [
        {
          name: 'kport',
          path: '/Users/dev/projects/kport',
          type: 'directory',
          children: [
            {
              name: 'package.json',
              path: '/Users/dev/projects/kport/package.json',
              type: 'file',
              size: 2048,
              modifiedAt: '2026-06-04',
            },
            {
              name: 'README.md',
              path: '/Users/dev/projects/kport/README.md',
              type: 'file',
              size: 1024,
              modifiedAt: '2026-06-03',
            },
          ],
        },
      ],
    },
    {
      name: 'deploy.zip',
      path: '/Users/dev/deploy.zip',
      type: 'file',
      size: 2048000,
      modifiedAt: '2026-06-01',
    },
    {
      name: '.env.local',
      path: '/Users/dev/.env.local',
      type: 'file',
      size: 512,
      modifiedAt: '2026-05-28',
    },
  ],
}

export const mockLocalFilesystemRoot: FileTreeNode = {
  name: '/',
  path: FILESYSTEM_ROOT,
  type: 'directory',
  children: [
    {
      name: 'Users',
      path: '/Users',
      type: 'directory',
      children: [localHomeTree],
    },
    {
      name: 'Applications',
      path: '/Applications',
      type: 'directory',
      children: [],
    },
    {
      name: 'tmp',
      path: '/tmp',
      type: 'directory',
      children: [],
    },
  ],
}

/** @deprecated Use mockLocalFilesystemRoot — kept as alias for home subtree root */
export const mockLocalTreeRoot = localHomeTree

export const mockRemoteFilesystemRoot: FileTreeNode = {
  name: '/',
  path: FILESYSTEM_ROOT,
  type: 'directory',
  children: [
    {
      name: 'home',
      path: '/home',
      type: 'directory',
      children: [
        {
          name: 'deploy',
          path: '/home/deploy',
          type: 'directory',
          children: [
            {
              name: '.bashrc',
              path: '/home/deploy/.bashrc',
              type: 'file',
              size: 256,
              modifiedAt: '2026-05-20',
            },
            {
              name: 'scripts',
              path: '/home/deploy/scripts',
              type: 'directory',
              children: [],
            },
          ],
        },
        {
          name: 'ubuntu',
          path: '/home/ubuntu',
          type: 'directory',
          children: [],
        },
      ],
    },
    {
      name: 'var',
      path: '/var',
      type: 'directory',
      children: [
        {
          name: 'www',
          path: '/var/www',
          type: 'directory',
          children: [
            {
              name: 'api',
              path: '/var/www/api',
              type: 'directory',
              children: [
                {
                  name: 'deploy.zip',
                  path: '/var/www/api/deploy.zip',
                  type: 'file',
                  size: 2048000,
                  modifiedAt: '2026-06-01',
                },
                {
                  name: 'docker-compose.yml',
                  path: '/var/www/api/docker-compose.yml',
                  type: 'file',
                  size: 1024,
                  modifiedAt: '2026-06-02',
                },
                {
                  name: '.env',
                  path: '/var/www/api/.env',
                  type: 'file',
                  size: 512,
                  modifiedAt: '2026-06-02',
                },
              ],
            },
          ],
        },
        {
          name: 'log',
          path: '/var/log',
          type: 'directory',
          children: [
            {
              name: 'app.log',
              path: '/var/log/app.log',
              type: 'file',
              size: 8192,
              modifiedAt: '2026-06-05',
            },
          ],
        },
      ],
    },
    {
      name: 'etc',
      path: '/etc',
      type: 'directory',
      children: [
        {
          name: 'nginx',
          path: '/etc/nginx',
          type: 'directory',
          children: [
            {
              name: 'nginx.conf',
              path: '/etc/nginx/nginx.conf',
              type: 'file',
              size: 4096,
              modifiedAt: '2026-05-30',
            },
          ],
        },
      ],
    },
  ],
}

/** @deprecated Use mockRemoteFilesystemRoot */
export const mockRemoteTreeRoot = mockRemoteFilesystemRoot
