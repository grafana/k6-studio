import { FuseResult } from 'fuse.js'

export function withMatches<T>(result: FuseResult<T>) {
  return {
    ...result.item,
    matches:
      result.matches?.flatMap((match) => ({
        indices: match.indices,
        value: match.value,
      })) ?? [],
  }
}
