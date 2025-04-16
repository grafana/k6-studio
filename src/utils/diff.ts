import { Change } from 'diff'

import { Match } from '@/types/fuse'

export function diffChangesToFuseIndices(diff: Change[]): Match['indices'] {
  return diff.reduce<{
    indices: Match['indices']
    start: number
  }>(
    (acc, part) => {
      if (part.added) {
        const newRange: [number, number] = [
          acc.start,
          acc.start + part.value.length - 1,
        ]
        return {
          indices: [...acc.indices, newRange],
          start: acc.start + part.value.length,
        }
      }

      if (!part.removed) {
        // Only advance start for non-removed parts
        return {
          ...acc,
          start: acc.start + part.value.length,
        }
      }

      return acc
    },
    { indices: [], start: 0 }
  ).indices
}
