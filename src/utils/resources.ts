import { app, nativeImage } from 'electron'
import path from 'path'

export function getResourcesPath() {
  return MAIN_WINDOW_VITE_DEV_SERVER_URL
    ? path.join(app.getAppPath(), 'resources')
    : process.resourcesPath
}

export function getAppIcon() {
  const iconPath = path.join(getResourcesPath(), 'icons', 'logo.png')

  return nativeImage.createFromPath(iconPath)
}
