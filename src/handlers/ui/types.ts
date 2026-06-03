import { StudioFile } from '@/types'

export interface GetFilesResponse {
  recordings: StudioFile[]
  generators: StudioFile[]
  scripts: StudioFile[]
  dataFiles: StudioFile[]
  browserTests: StudioFile[]
}

export enum UIHandler {
  ToggleTheme = 'ui:toggle-theme',
  DetectBrowser = 'ui:detect-browser',
  OpenFolder = 'ui:open-folder',
  OpenFileInDefaultApp = 'ui:open-file-in-default-app',
  TrashFile = 'ui:trash-file',
  GetFiles = 'ui:get-files',
  RenameFile = 'ui:rename-file',
  ReportIssue = 'ui:report-issue',
  AddFile = 'ui:add-file',
  RemoveFile = 'ui:remove-file',
  Toast = 'ui:toast',
  SetMenuState = 'ui:set-menu-state',
  RequestSave = 'ui:request-save',
}

export type MenuItemTuple = ['save', 'saveAs', 'exportScript']
export type MenuItem = MenuItemTuple[number]
export type MenuState = { [P in MenuItem]: boolean }
