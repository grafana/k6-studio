import { StudioFile } from '@/types'

export interface GetFilesResponse {
  recordings: StudioFile[]
  generators: StudioFile[]
  scripts: StudioFile[]
  dataFiles: StudioFile[]
}

export enum UIHandler {
  TOGGLE_THEME = 'ui:toggle-theme',
  DETECT_BROWSER = 'ui:detect-browser',
  OPEN_FOLDER = 'ui:open-folder',
  OPEN_FILE_IN_DEFAULT_APP = 'ui:open-file-in-default-app',
  DELETE_FILE = 'ui:delete-file',
  GET_FILES = 'ui:get-files',
  RENAME_FILE = 'ui:rename-file',
  REPORT_ISSUE = 'ui:report-issue',
  ADD_FILE = 'ui:add-file',
  REMOVE_FILE = 'ui:remove-file',
  TOAST = 'ui:toast',
}
