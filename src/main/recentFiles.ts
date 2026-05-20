import { app } from 'electron'

export function getRecentFiles(): string[] {
  return app.getRecentDocuments()
}

export function addRecentFile(newFilePath: string) {
  app.addRecentDocument(newFilePath)
}

export function clearRecentFiles() {
  app.clearRecentDocuments()
}
