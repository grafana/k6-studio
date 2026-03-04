import { BrowserTestFile } from '@/schemas/browserTest/v1'
import { Recording } from '@/schemas/recording'
import { GeneratorFileData } from '@/types/generator'
import { K6TestOptions } from '@/utils/k6/schema'

export enum FileHandler {
  Save = 'file:save',
  Open = 'file:open',
}

export type FileContent =
  | { type: 'generator'; data: GeneratorFileData }
  | { type: 'browser-test'; data: BrowserTestFile }
  | { type: 'script'; content: string }
  | { type: 'recording'; data: Recording }

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
  | { type: 'recording'; data: Recording }
  | {
      type: 'script'
      content: string
      options: K6TestOptions
      isExternal: boolean
    }
