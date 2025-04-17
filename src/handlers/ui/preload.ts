import { ipcRenderer } from 'electron'

import { StudioFile } from '@/types'
import { AddToastPayload } from '@/types/toast'

import { createListener } from '../utils'

import { GetFilesResponse } from './types'

export function toggleTheme() {
  ipcRenderer.send('ui:toggle-theme')
}

export function detectBrowser() {
  return ipcRenderer.invoke('ui:detect-browser') as Promise<boolean>
}

export function openContainingFolder(file: StudioFile) {
  ipcRenderer.send('ui:open-folder', file)
}

export function openFileInDefaultApp(file: StudioFile) {
  return ipcRenderer.invoke(
    'ui:open-file-in-default-app',
    file
  ) as Promise<string>
}

export function deleteFile(file: StudioFile) {
  return ipcRenderer.invoke('ui:delete-file', file) as Promise<void>
}

export function getFiles() {
  return ipcRenderer.invoke('ui:get-files') as Promise<GetFilesResponse>
}

export function renameFile(
  oldFileName: string,
  newFileName: string,
  type: StudioFile['type']
) {
  return ipcRenderer.invoke(
    'ui:rename-file',
    oldFileName,
    newFileName,
    type
  ) as Promise<void>
}

export function reportIssue() {
  return ipcRenderer.invoke('ui:report-issue') as Promise<void>
}

export function onAddFile(callback: (file: StudioFile) => void) {
  return createListener('ui:add-file', callback)
}

export function onRemoveFile(callback: (file: StudioFile) => void) {
  return createListener('ui:remove-file', callback)
}

export function onToast(callback: (toast: AddToastPayload) => void) {
  return createListener('ui:toast', callback)
}
