export function getFileNameFromPath(path: string) {
  return path.split('/').pop() ?? ''
}

export function generateFileNameWithTimestamp(
  extension: string,
  prefix?: string
) {
  const timestamp =
    new Date()
      .toISOString()
      .replace(/:/g, '-')
      .replace(/T/g, ' - ')
      .split('.')[0] ?? ''
  return `${prefix ? `${prefix} - ` : ''}${timestamp}.${extension}`
}
