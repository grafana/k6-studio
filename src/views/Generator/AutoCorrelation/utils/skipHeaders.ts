import { shouldSkipCookie } from './skipCookies'

// Standard, server-generated response headers that a client never extracts
// and replays, so they can never be correlation sources or targets.
const SKIP_HEADERS = [
  'date',
  'age',
  'expires',
  'last-modified',
  'etag',
  'cf-ray',
  'content-length',
  'transfer-encoding',
  'content-type',
  'user-agent',
  'server-timing',
  'alt-svc',
  'vary',
  'via',
  'server',
  'accept-ranges',
  'retry-after',
  'keep-alive',
]

// Substring patterns covering server-issued diagnostic id and rate-limit
// header families across vendors (e.g. grafana-trace-id, x-datadog-trace-id,
// x-amzn-requestid, audit-id, x-ratelimit-remaining). Kept generic so new
// vendor prefixes are filtered without enumerating each one.
const SKIP_HEADER_PATTERNS = [
  'trace-id',
  'request-id',
  'requestid',
  'correlation-id',
  'span-id',
  'audit-id',
  'ratelimit',
  'rate-limit',
]

export function shouldSkipHeader(key: string) {
  const lowerKey = key.toLowerCase()

  // A set-cookie header is normalized to `set-cookie.<name>`; the cookie skip
  // rules own the functional-vs-noise decision, so consult them before the
  // header-name patterns (a cookie name may incidentally contain a pattern).
  if (lowerKey.startsWith('set-cookie.')) {
    const cookieName = lowerKey.slice('set-cookie.'.length)
    return shouldSkipCookie(cookieName)
  }

  if (SKIP_HEADERS.includes(lowerKey)) {
    return true
  }

  if (SKIP_HEADER_PATTERNS.some((pattern) => lowerKey.includes(pattern))) {
    return true
  }

  return false
}
