import { StudioFile } from '@/types'

export type FileItem = StudioFile & {
  matches?: Array<[number, number]>
}
