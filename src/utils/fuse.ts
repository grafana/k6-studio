import { FuseResult } from 'fuse.js'

import { Match } from '@/types/fuse'

type ResultWithMatch<T> = T & {
  matches: Match[]
}

export function withMatches<T>(result: FuseResult<T>): ResultWithMatch<T> {
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
