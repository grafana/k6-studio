import { app } from 'electron'
import { writeFile, open } from 'fs/promises'
import path from 'node:path'
import { AppSettings } from './types/settings'

const defaultSettings: AppSettings = {
  version: '1.0',
  proxy: {
    mode: 'regular',
    port: 6000,
    automaticallyFindPort: true,
    upstream: {
      url: 'http://example.com:8080',
      requireAuth: false,
      username: '',
      password: '',
    },
  },
  recorder: {
    detectBrowserPath: true,
    browserPath: '',
  },
}

const fileName =
  process.env.NODE_ENV === 'development'
    ? 'k6-studio-dev.json'
    : 'k6-studio.json'
const filePath = path.join(app.getPath('userData'), fileName)

/**
 * Initializes the settings file if it doesn't exist.
 */
async function initSettings() {
  try {
    const fileHandle = await open(filePath, 'r')
    await fileHandle.close()
  } catch {
    await writeFile(filePath, JSON.stringify(defaultSettings))
  }
}

/**
 * Retrieve  the current settings from the settings file
 * @returns The current settings as JSON
 */
export async function getSettings() {
  await initSettings()
  const fileHandle = await open(filePath, 'r')
  try {
    const settings = await fileHandle?.readFile({ encoding: 'utf-8' })
    return JSON.parse(settings) as AppSettings
  } finally {
    await fileHandle?.close()
  }
}

/**
 * Write the new settings to the settings file
 * @param newSettings
 * @returns The settings that have changed
 */
export async function saveSettings(newSettings: AppSettings) {
  const currentSettings = await getSettings()
  const diff = getSettingsDiff(currentSettings, newSettings)
  await writeFile(filePath, JSON.stringify(newSettings))
  return diff
}

/**
 * Compares old and new settings
 * @param oldSettings
 * @param newSettings
 * @returns the difference between the old and new settings
 */
function getSettingsDiff(oldSettings: AppSettings, newSettings: AppSettings) {
  const diff: Record<string, unknown> = {}

  for (const key in newSettings) {
    const typedKey = key as keyof AppSettings
    const oldJSON = JSON.stringify(oldSettings[typedKey])
    const newJSON = JSON.stringify(newSettings[typedKey])

    if (oldJSON !== newJSON) {
      diff[typedKey] = newSettings[typedKey]
    }
  }

  return diff
}
