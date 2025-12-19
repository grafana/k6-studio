import { app } from 'electron'
import { readFile } from 'fs/promises'
import path from 'path'

const RESOURCE_INDEX = {
  'browser-script': 'browser/index.js',
  'replay-script': 'replay.js',
  'entrypoint-script': 'entrypoint.js',
}

export type ResourceName = keyof typeof RESOURCE_INDEX

function getResourceRootPath() {
  // @ts-expect-error We are targeting CommonJS so import.meta is not available
  return !import.meta.env.PROD
    ? path.join(app.getAppPath(), 'resources').trim()
    : process.resourcesPath
}

export function getResourcePath(resource: ResourceName): string {
  return path.join(getResourceRootPath(), RESOURCE_INDEX[resource])
}

export function readResource(resource: ResourceName) {
  return readFile(getResourcePath(resource), { encoding: 'utf-8' })
}
