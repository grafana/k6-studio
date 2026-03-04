import { BrowserTestFile } from '@/schemas/browserTest/v1'
import { Recording } from '@/schemas/recording'
import { GeneratorFileData } from '@/types/generator'

export enum FileHandler {
  Save = 'file:save',
}

export type SaveFileContent =
  | { type: 'generator'; data: GeneratorFileData }
  | { type: 'browser-test'; data: BrowserTestFile }
  | { type: 'script'; content: string }
  | { type: 'recording'; data: Recording }

export type SaveFileLocation =
  | { type: 'path'; path: string }
  | { type: 'legacy'; name: string }
  | { type: 'new'; hint: string }

export interface SaveFilePayload {
  content: SaveFileContent
  location: SaveFileLocation
}
