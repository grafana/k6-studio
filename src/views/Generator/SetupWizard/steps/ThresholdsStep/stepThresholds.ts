import { Threshold } from '@/types/testOptions'

/**
 * Splits the store's thresholds into the rows this step owns (suggestions and
 * anything the user added during the step) and the rows that pre-date it.
 */
export function partitionThresholds(
  thresholds: Threshold[],
  preexistingIds: string[]
) {
  const preexistingIdSet = new Set(preexistingIds)

  return {
    shown: thresholds.filter(
      (threshold) => !preexistingIdSet.has(threshold.id)
    ),
    preexisting: thresholds.filter((threshold) =>
      preexistingIdSet.has(threshold.id)
    ),
  }
}

/**
 * Applies edits made to the shown rows back onto the full list, leaving the
 * hidden pre-existing rows untouched.
 */
export function mergeShownThresholds(
  thresholds: Threshold[],
  preexistingIds: string[],
  nextShown: Threshold[]
): Threshold[] {
  const { preexisting } = partitionThresholds(thresholds, preexistingIds)

  return [...preexisting, ...nextShown]
}
