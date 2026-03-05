import { BrowserTestFile } from '@/schemas/browserTest/v1'
import { GeneratorFileData } from '@/types/generator'
import { RecordingData } from '@/types/recordingData'

export enum FileHandler {
  Save = 'file:save',
  Open = 'file:open',
  GetTempPath = 'file:get-temp-path',
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
  | { type: 'legacy'; name: string }
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
