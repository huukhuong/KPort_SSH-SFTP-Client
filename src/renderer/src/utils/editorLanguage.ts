export function getLanguageForPath(path: string): string {
  const baseName = path.split('/').pop() ?? path
  const dotIndex = baseName.lastIndexOf('.')
  const ext = dotIndex >= 0 ? baseName.slice(dotIndex + 1).toLowerCase() : ''

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
    case 'jsx':
      return 'javascript'
    case 'css':
      return 'css'
    case 'html':
      return 'html'
    case 'sh':
      return 'shell'
    case 'sql':
      return 'sql'
    case 'xml':
      return 'xml'
    case 'log':
      return 'plaintext'
    default:
      if (baseName === '.env' || baseName.startsWith('.env.')) return 'ini'
      return 'plaintext'
  }
}
