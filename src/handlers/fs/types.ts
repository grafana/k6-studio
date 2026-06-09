import { BrowserTestFile } from '@/schemas/browserTest'
import { BrowserEvent } from '@/schemas/recording'
import { ProxyData } from '@/types'
import { GeneratorFileData } from '@/types/generator'
import { DataFilePreview } from '@/types/testData'
import { K6TestOptions } from '@/utils/k6/schema'

export enum FsHandler {
  GetTempScriptPath = 'fs:get-temp-script-path',
  ShowOpenDialog = 'fs:show-open-dialog',
  ShowSaveAsDialog = 'fs:show-save-as-dialog',
  SaveFile = 'fs:save-file',
  OpenFile = 'fs:open-file',
}

export interface UntitledLocation {
  type: 'untitled'
  hint: string
}

export interface FileLocation {
  type: 'file'
  path: string
}

export type StorageLocation = UntitledLocation | FileLocation

export interface GeneratorContent {
  type: 'generator'
  data: GeneratorFileData
  isExternal: boolean
}

export interface BrowserTestContent {
  type: 'browser-test'
  data: BrowserTestFile
  isExternal: boolean
}

export interface RecordingContent {
  type: 'recording'
  data: ProxyData[]
  browserEvents: BrowserEvent[]

  // Temporary until we support referencing external recordings in HTTP tests.
  isExternal: boolean
}

export interface ScriptContent {
  type: 'script'
  data: string
  isExternal: boolean
  options: K6TestOptions
}

export interface DataFileContent {
  type: 'data-file'
  data: DataFilePreview
  isExternal: boolean
}

export interface UnsupportedContent {
  type: 'unsupported'
  isExternal: boolean
}

export type FileContent =
  | GeneratorContent
  | BrowserTestContent
  | RecordingContent
  | ScriptContent
  | DataFileContent
  | UnsupportedContent
