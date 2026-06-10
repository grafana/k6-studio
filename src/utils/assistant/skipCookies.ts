// Cookies that change on every request and are never relevant for correlation.
// Entries ending with '*' use prefix matching; others are exact matches.
const SKIP_COOKIES = [
  // Load balancer / CDN
  'awsalb',
  'awsalbcors',
  'incap_ses_*',
  'visid_incap_*',
  '__cfduid',
  'cf_clearance',
  'ts01*',
  'bigipserver*',
  'route',
  'sticky-session',
  // Server session IDs (managed by cookie jar)
  'jsessionid',
  'phpsessid',
  'asp.net_sessionid',
  // Google Analytics
  '_ga*',
  '_gid',
  // Rudder Analytics
  'rl_*',
  // Intercom
  'intercom-*',
  // FullStory
  'fs_*',
  // Segment
  'ajs_*',
  // Hubspot
  '__hs*',
  'hubspot*',
]

export function shouldSkipCookie(cookieName: string) {
  const lowerName = cookieName.toLowerCase()
  return SKIP_COOKIES.some((pattern) => {
    if (pattern.endsWith('*')) {
      return lowerName.startsWith(pattern.slice(0, -1))
    }
    return lowerName === pattern
  })
}
