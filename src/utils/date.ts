/**
 * Formats a date as `YYYY-MM-DD` using the local time zone.
 *
 * Unlike `Date.prototype.toISOString`, which always uses UTC, this reflects the
 * user's calendar day. Using UTC caused recording file names to be prefixed
 * with the wrong date for users whose local day differs from the UTC day.
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
