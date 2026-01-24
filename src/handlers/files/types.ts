import { BrowserTestFile } from '@/schemas/browserTest/v1'
import { GeneratorFileData } from '@/types/generator'

export enum FilesHandler {
  Open = 'files:open',
  Save = 'files:save',
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
  content: string
}

export type FileContent = HttpTestContent | BrowserTestContent | ScriptContent

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
