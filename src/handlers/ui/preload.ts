import { ipcRenderer } from 'electron'

import { StudioFile } from '@/types'
import { AddToastPayload } from '@/types/toast'

import { createListener } from '../utils'

import { GetFilesResponse, UIHandler } from './types'

export function toggleTheme() {
  ipcRenderer.send(UIHandler.ToggleTheme)
}

export function detectBrowser() {
  return ipcRenderer.invoke(UIHandler.DetectBrowser) as Promise<boolean>
}

export function openContainingFolder(file: StudioFile) {
  ipcRenderer.send(UIHandler.OpenFolder, file)
}

export function openFileInDefaultApp(file: StudioFile) {
  return ipcRenderer.invoke(
    UIHandler.OpenFileInDefaultApp,
    file
  ) as Promise<string>
}

export function deleteFile(file: StudioFile) {
  return ipcRenderer.invoke(UIHandler.DeleteFile, file) as Promise<void>
}

export function getFiles() {
  return ipcRenderer.invoke(UIHandler.GetFiles) as Promise<GetFilesResponse>
}

export function renameFile(
  oldFileName: string,
  newFileName: string,
  type: StudioFile['type']
) {
  return ipcRenderer.invoke(
    UIHandler.RenameFile,
    oldFileName,
    newFileName,
    type
  ) as Promise<void>
}

export function reportIssue() {
  return ipcRenderer.invoke(UIHandler.ReportIssue) as Promise<void>
}

export function onAddFile(callback: (file: StudioFile) => void) {
  return createListener(UIHandler.AddFile, callback)
}

export function onRemoveFile(callback: (file: StudioFile) => void) {
  return createListener(UIHandler.RemoveFile, callback)
}

export function onToast(callback: (toast: AddToastPayload) => void) {
  return createListener(UIHandler.Toast, callback)
}
