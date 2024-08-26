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
