import { RangeTuple } from 'fuse.js'

export interface Match {
  indices: ReadonlyArray<RangeTuple>
  value?: string
  key?: string
  color?: string
}
