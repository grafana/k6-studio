import { app } from 'electron'
import { readFile } from 'fs/promises'
import path from 'path'

const RESOURCES_ROOT_PATH = MAIN_WINDOW_VITE_DEV_SERVER_URL
  ? path.join(app.getAppPath(), 'resources')
  : process.resourcesPath

const RESOURCE_INDEX = {
  'browser-script': 'browser/index.js',
}

export type ResourceName = keyof typeof RESOURCE_INDEX

function getResourcePath(resource: ResourceName): string {
  return path.join(RESOURCES_ROOT_PATH, RESOURCE_INDEX[resource])
}

export function readResource(resource: ResourceName) {
  return readFile(getResourcePath(resource), { encoding: 'utf-8' })
}
