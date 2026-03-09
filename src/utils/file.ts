import { getRoutePath } from '../routeMap'

/** Display name for a data file path (basename). Safe for UI in browser and Node. */
export function getDataFileDisplayName(filePath: string) {
  const base = filePath.replace(/^.*[/\\]/, '')
  return base || filePath
}

export function getFileNameWithoutExtension(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, '')
}

export function getFileExtension(fileName: string) {
  return fileName.split('.').pop()
}

export function getViewPath(path: string) {
  const encodedPath = encodeURIComponent(path)

  return getRoutePath('editorView', { path: encodedPath })
}
