import { app } from 'electron'

export function isMsiInstall(): boolean {
  const exePath = app.getPath('exe')
  return (
    exePath.includes('\\Program Files') ||
    exePath.includes('\\Program Files (x86)')
  )
}
