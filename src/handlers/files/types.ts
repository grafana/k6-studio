import { BrowserTestFile } from '@/schemas/browserTest/v1'
import { BrowserEvent } from '@/schemas/recording'
import { ProxyData } from '@/types'
import { GeneratorFileData } from '@/types/generator'

export enum FilesHandler {
  Open = 'files:open',
  Save = 'files:save',
}

export interface RecordingContent {
  type: 'recording'
  requests: ProxyData[]
  browserEvents: BrowserEvent[]
}

export interface HttpTestContent {
  type: 'http-test'
  test: GeneratorFileData
}

export interface BrowserTestContent {
  type: 'browser-test'
  test: BrowserTestFile
}

export interface ScriptContent {
  type: 'script'
  script: string
}

export type FileContent =
  | RecordingContent
  | HttpTestContent
  | BrowserTestContent
  | ScriptContent

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
