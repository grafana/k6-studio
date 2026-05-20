import { BrowserTestFile } from '@/schemas/browserTest'
import { GeneratorFileData } from '@/types/generator'

export enum FsHandler {
  GetTempScriptPath = 'fs:get-temp-script-path',
  ShowSaveAsDialog = 'fs:show-save-as-dialog',
  SaveFile = 'fs:save-file',
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
}

export interface BrowserTestContent {
  type: 'browser-test'
  content: BrowserTestFile
}

export interface ScriptContent {
  type: 'script'
  content: string
}

export type FileContent = GeneratorContent | BrowserTestContent | ScriptContent
