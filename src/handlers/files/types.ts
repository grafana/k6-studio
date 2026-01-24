import { GeneratorFileData } from '@/types/generator'

export enum FilesHandler {
  Save = 'files:save',
}

export interface GeneratorContent {
  type: 'generator'
  generator: GeneratorFileData
}

export type FileContent = GeneratorContent

export interface FileOnDisk {
  type: 'file-on-disk'
  name: string
  path: string
}

export type FileLocation = FileOnDisk

export interface OpenFile {
  location: FileLocation
  content: GeneratorContent
}
