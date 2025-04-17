import { FuseResult } from 'fuse.js'

import { Match } from '@/types/fuse'

type ResultWithMatch<T> = T & {
  matches: Match[]
}

export function withMatches<T>(result: FuseResult<T>): ResultWithMatch<T> {
  // @ts-expect-error assigning readonly indices to mutable
  return {
    ...result.item,
    matches:
      result.matches?.flatMap((match) => ({
        indices: match.indices,
        value: match.value,
        key: match.key,
      })) ?? [],
  }
}
