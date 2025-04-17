import { StudioFile } from '@/types'

export interface GetFilesResponse {
  recordings: StudioFile[]
  generators: StudioFile[]
  scripts: StudioFile[]
  dataFiles: StudioFile[]
}
