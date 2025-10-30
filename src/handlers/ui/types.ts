import { StudioFile } from '@/types'

export interface GetFilesResponse {
  recordings: StudioFile[]
  generators: StudioFile[]
  scripts: StudioFile[]
  dataFiles: StudioFile[]
}

export enum UIHandler {
  ToggleTheme = 'ui:toggle-theme',
  DetectBrowser = 'ui:detect-browser',
  OpenFolder = 'ui:open-folder',
  OpenFileInDefaultApp = 'ui:open-file-in-default-app',
  DeleteFile = 'ui:delete-file',
  GetFiles = 'ui:get-files',
  RenameFile = 'ui:rename-file',
  ReportIssue = 'ui:report-issue',
  AddFile = 'ui:add-file',
  RemoveFile = 'ui:remove-file',
  Toast = 'ui:toast',
}
