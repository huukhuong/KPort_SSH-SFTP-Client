export const IPC_CHANNELS = {
  SERVERS_LIST: 'servers:list',
  SERVERS_CREATE: 'servers:create',
  SERVERS_UPDATE: 'servers:update',
  SERVERS_DELETE: 'servers:delete',
  SERVERS_TOGGLE_FAVORITE: 'servers:toggleFavorite',
  SSH_CONNECT: 'ssh:connect',
  SSH_DISCONNECT: 'ssh:disconnect',
  SSH_TEST: 'ssh:test',
  SSH_GET_STATUS: 'ssh:getStatus',
  SFTP_LIST: 'sftp:list',
  FS_GET_PATHS: 'fs:getPaths',
  FS_LIST: 'fs:list',
} as const
