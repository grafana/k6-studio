import { GeneratorFileData } from '@/types/generator'

export enum FilesHandler {
  Save = 'files:save',
}

export interface GeneratorContent {
  type: 'generator'
  generator: GeneratorFileData
}

export interface ScriptContent {
  type: 'script'
  content: string
}

export type FileContent = GeneratorContent | ScriptContent

export interface UntitledFile {
  type: 'untitled'
  name: string
}

export interface FileOnDisk {
  type: 'file-on-disk'
  name: string
  path: string
}

export type FileLocation = FileOnDisk | UntitledFile

export interface OpenFile<Location extends FileLocation = FileLocation> {
  location: Location
  content: FileContent
}
