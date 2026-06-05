import { FuseResult } from 'fuse.js'
import { uniqBy } from 'lodash-es'

import { Match } from '@/types/fuse'

type ResultWithMatch<T> = T & {
  matches: Match[]
}

export function withMatches<T>(result: FuseResult<T>): ResultWithMatch<T> {
  const matches =
    result.matches?.map((match) => ({
      indices: match.indices,
      value: match.value,
      key: match.key,
    })) ?? []

  return {
    ...result.item,
    // Fuse emits one match per array element, so repeated header/cookie names
    // (or repeated values) produce identical matches that differ only by their
    // position. Deduplicate them to avoid rendering the same text more than once.
    matches: uniqBy(matches, (match) => JSON.stringify(match)),
  }
}
