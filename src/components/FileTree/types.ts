import { StudioFile } from '@/types'
import { Match } from '@/types/fuse'

export type FileItem = StudioFile & {
  matches?: Match[]
}
