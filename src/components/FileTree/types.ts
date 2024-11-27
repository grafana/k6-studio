import { StudioFile } from '@/types'
import { SearchMatch } from '@/types/fuse'

export type FileItem = StudioFile & {
  matches?: SearchMatch[]
}
