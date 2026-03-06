import { BrowserTestFile } from '@/schemas/browserTest/v1'
import { StudioFile } from '@/types'
import { GeneratorFileData } from '@/types/generator'
import { RecordingData } from '@/types/recordingData'

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
  | { type: 'generator'; data: GeneratorFileData }
  | { type: 'browser-test'; data: BrowserTestFile }
  | { type: 'script'; content: string }
  | { type: 'recording'; data: RecordingData }

export type FileContentType = FileContent['type']

export type FileLocation =
  | { type: 'path'; path: string }
  | { type: 'new'; hint: string }

export interface SaveFilePayload {
  content: FileContent
  location: FileLocation
}

export interface OpenFileRequest {
  location: FileLocation
  fileType: FileContentType
}

export type OpenFileResult =
  | { type: 'generator'; data: GeneratorFileData }
  | { type: 'browser-test'; data: BrowserTestFile }
  | { type: 'recording'; data: RecordingData }
  | { type: 'script'; content: string; isExternal: boolean }
