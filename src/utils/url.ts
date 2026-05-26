const ALLOWED_PROTOCOLS = new Set(['http:', 'https:'])

export function validateExternalUrl(url: string): string {
  const parsed = new URL(url)
  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new Error(`Blocked URL with disallowed protocol: ${parsed.protocol}`)
  }
  return url
}
