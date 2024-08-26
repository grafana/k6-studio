export function generateFileNameWithTimestamp(
  extension: string,
  prefix?: string
) {
  const timestamp =
    new Date()
      .toISOString()
      .replace(/:/g, '-')
      .replace(/T/g, '_')
      .split('.')[0] ?? ''
  return `${prefix ? `${prefix} - ` : ''}${timestamp}.${extension}`
}

function normalizeFilePath(path: string): string {
  return path.replace(/\\/g, '/')
}

export function encodeFilePath(path: string): string {
  const normalizedPath = normalizeFilePath(path)

  return encodeURIComponent(normalizedPath)
}

export function decodeFilePath(encodedPath: string): string {
  const decodedPath = decodeURIComponent(encodedPath)
  if (process.platform === 'win32') {
    return decodedPath.replace(/\//g, '\\')
  }

  return decodedPath
}
