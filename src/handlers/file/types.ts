import { BrowserTestFile } from '@/schemas/browserTest/v1'
import { StudioFile, SupportedFileType } from '@/types'
import { GeneratorFileData } from '@/types/generator'
import { RecordingData } from '@/types/recordingData'
import { DataRecord } from '@/types/testData'
import { JsonObject } from '@/utils/json'

export enum FileHandler {
  Save = 'file:save',
  Open = 'file:open',
  GetTempPath = 'file:get-temp-path',
  ListDirectory = 'file:list-directory',
}

export type DirectoryEntry =
  | {
      type: 'directory'
      basename: string
      path: string
    }
  | {
      type: 'file'
      basename: string
      path: string
      file: StudioFile | null
    }

export interface ListDirectoryArgs {
  path: string
}

export interface GetTempPathArgs {
  prefix?: string
  extension?: string
}

export type FileContent =
  | GeneratorFileContent
  | BrowserTestFileContent
  | RecordingFileContent
  | ScriptFileContent

export type FileContentType = FileContent['type']

export interface FileOnDisk {
  type: 'path'
  path: string
}

export interface UnsavedFile {
  type: 'new'
  hint: string
}

export type FileLocation = FileOnDisk | UnsavedFile

export interface SaveFilePayload {
  content: FileContent
  location: FileLocation
}

export interface OpenFileRequest {
  location: FileOnDisk
  fileType?: SupportedFileType
}

export interface GeneratorFileContent {
  type: 'generator'
  data: GeneratorFileData
}

export interface BrowserTestFileContent {
  type: 'browser-test'
  data: BrowserTestFile
}

export interface RecordingFileContent {
  type: 'recording'
  data: RecordingData
}

export interface ScriptFileContent {
  type: 'script'
  content: string
}
export interface JsonFileContent {
  type: 'json'
  props: string[]
  data: JsonObject[]
  total: number
}

export interface CsvFileContent {
  type: 'csv'
  props: string[]
  data: DataRecord[]
  total: number
}

export interface UnsupportedFileContent {
  type: 'unsupported-format'
}

export type OpenFileResult =
  | GeneratorFileContent
  | BrowserTestFileContent
  | RecordingFileContent
  | (ScriptFileContent & { isExternal: boolean })
  | JsonFileContent
  | CsvFileContent
  | UnsupportedFileContent
