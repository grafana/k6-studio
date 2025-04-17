import { ipcRenderer } from 'electron'

import { StudioFile } from '@/types'
import { AddToastPayload } from '@/types/toast'

import { createListener } from '../utils'

import { GetFilesResponse, UIHandler } from './types'

export function toggleTheme() {
  ipcRenderer.send(UIHandler.TOGGLE_THEME)
}

export function detectBrowser() {
  return ipcRenderer.invoke(UIHandler.DETECT_BROWSER) as Promise<boolean>
}

export function openContainingFolder(file: StudioFile) {
  ipcRenderer.send(UIHandler.OPEN_FOLDER, file)
}

export function openFileInDefaultApp(file: StudioFile) {
  return ipcRenderer.invoke(
    UIHandler.OPEN_FILE_IN_DEFAULT_APP,
    file
  ) as Promise<string>
}

export function deleteFile(file: StudioFile) {
  return ipcRenderer.invoke(UIHandler.DELETE_FILE, file) as Promise<void>
}

export function getFiles() {
  return ipcRenderer.invoke(UIHandler.GET_FILES) as Promise<GetFilesResponse>
}

export function renameFile(
  oldFileName: string,
  newFileName: string,
  type: StudioFile['type']
) {
  return ipcRenderer.invoke(
    UIHandler.RENAME_FILE,
    oldFileName,
    newFileName,
    type
  ) as Promise<void>
}

export function reportIssue() {
  return ipcRenderer.invoke(UIHandler.REPORT_ISSUE) as Promise<void>
}

export function onAddFile(callback: (file: StudioFile) => void) {
  return createListener(UIHandler.ADD_FILE, callback)
}

export function onRemoveFile(callback: (file: StudioFile) => void) {
  return createListener(UIHandler.REMOVE_FILE, callback)
}

export function onToast(callback: (toast: AddToastPayload) => void) {
  return createListener(UIHandler.TOAST, callback)
}
