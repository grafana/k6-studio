import { app, BrowserWindow, dialog, nativeTheme } from 'electron'
import log from 'electron-log/main'
import { existsSync, readFileSync } from 'fs'
import { writeFile, open } from 'fs/promises'
import path from 'path'

import { resetAiModel } from '@/handlers/ai/model'
import { configureSystemProxy } from '@/services/http'

import { AppSettingsSchema } from '../schemas/settings'
import { AppSettings } from '../types/settings'
import { getPlatform } from '../utils/electron'
import { safeJsonParse } from '../utils/json'
import { getExecutableNameFromPlist } from '../utils/plist'

import { encryptString, decryptString } from './encryption'
import { stopProxyProcess, launchProxyAndAttachEmitter } from './proxy'

export const defaultSettings: AppSettings = {
  version: '4.0',
  proxy: {
    mode: 'regular',
    port: 6000,
    automaticallyFindPort: true,
    sslInsecure: false,
  },
  recorder: { detectBrowserPath: true, browserRecording: 'extension' },
  windowState: { width: 1200, height: 800, x: 0, y: 0, isMaximized: true },
  telemetry: { usageReport: true, errorReport: true },
  appearance: { theme: 'system' },
  ai: { provider: 'openai' },
}

const fileName =
  process.env.NODE_ENV === 'development'
    ? 'k6-studio-dev.json'
    : 'k6-studio.json'
const filePath = path.join(app.getPath('userData'), fileName)

/**
 * Initializes the settings file if it doesn't exist or is invalid
 */
export async function initSettings() {
  if (!existsSync(filePath) || !isSettingsJsonObject()) {
    return writeFile(filePath, JSON.stringify(defaultSettings))
  }
}

/**
 * Retrieve  the current settings from the settings file
 * @returns The current settings as JSON
 */
export async function getSettings() {
  const fileHandle = await open(filePath, 'r')
  try {
    const settings = await fileHandle?.readFile({ encoding: 'utf-8' })
    // TODO: https://github.com/grafana/k6-studio/issues/277
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const currentSettings = JSON.parse(settings)
    // TODO: https://github.com/grafana/k6-studio/issues/277
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const allSettings = { ...defaultSettings, ...currentSettings }
    return AppSettingsSchema.parse(allSettings)
  } catch (error) {
    log.error('Failed to parse settings file', error)
    // if the file is invalid during runtime,
    // return a valid settings object so the app can keep running
    return defaultSettings
  } finally {
    await fileHandle?.close()
  }
}

/**
 * Write the new settings to the settings file
 * @param settings
 * @returns The settings that have changed
 */
export async function saveSettings(settings: Partial<AppSettings>) {
  const currentSettings = await getSettings()
  const newSettings = { ...currentSettings, ...settings }

  if (currentSettings.ai.apiKey !== newSettings.ai.apiKey) {
    newSettings.ai.apiKey = processApiKeyForStorage(newSettings.ai.apiKey)
  }

  await writeFile(filePath, JSON.stringify(newSettings))
  return getSettingsDiff(currentSettings, settings)
}

/**
 * Compares old and new settings
 * @param oldSettings
 * @param newSettings
 * @returns the difference between the old and new settings
 */
function getSettingsDiff(
  oldSettings: AppSettings,
  newSettings: Partial<AppSettings>
) {
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

/***
 * Ensures the file is in JSON format (including not being empty)
 * @returns whether or not the file is a JSON object
 */
function isSettingsJsonObject() {
  const settings = readFileSync(filePath, 'utf-8')
  return safeJsonParse(settings.toString()) !== undefined
}

export async function selectBrowserExecutable() {
  const extensions = { mac: ['app'], win: ['exe'], linux: ['*'] }

  const { canceled, filePaths, bookmarks } = await dialog.showOpenDialog({
    title: 'Select browser executable',
    properties: ['openFile'],
    filters: [{ name: 'Executables', extensions: extensions[getPlatform()] }],
  })

  function getFilePaths() {
    if (getPlatform() === 'mac') {
      return filePaths.map((filePath) => {
        const plistPath = path.join(filePath, 'Contents', 'Info.plist')
        const executableName = getExecutableNameFromPlist(plistPath)
        if (executableName) {
          return path.join(filePath, 'Contents', 'MacOS', executableName)
        }
        return filePath
      })
    }
    return filePaths
  }

  return { canceled, bookmarks, filePaths: getFilePaths() }
}

export async function selectUpstreamCertificate() {
  return dialog.showOpenDialog({
    title: 'Select certificate',
    properties: ['openFile'],
    filters: [{ name: 'Proxy certificate', extensions: ['pem', 'cer', 'p12'] }],
  })
}

export async function applySettings(
  modifiedSettings: Partial<AppSettings>,
  browserWindow: BrowserWindow
) {
  if (modifiedSettings.proxy) {
    await stopProxyProcess()

    k6StudioState.appSettings.proxy = modifiedSettings.proxy
    k6StudioState.currentProxyProcess =
      await launchProxyAndAttachEmitter(browserWindow)

    await configureSystemProxy()
  }

  if (modifiedSettings.recorder) {
    k6StudioState.appSettings.recorder = modifiedSettings.recorder
  }

  if (modifiedSettings.telemetry) {
    k6StudioState.appSettings.telemetry = modifiedSettings.telemetry
  }

  if (modifiedSettings.appearance) {
    k6StudioState.appSettings.appearance = modifiedSettings.appearance
    nativeTheme.themeSource = k6StudioState.appSettings.appearance.theme
  }

  if (modifiedSettings.ai) {
    k6StudioState.appSettings.ai = modifiedSettings.ai
    resetAiModel()
  }
}

function processApiKeyForStorage(
  apiKey: string | undefined
): string | undefined {
  if (apiKey === undefined || apiKey.trim() === '') {
    return undefined
  }

  try {
    return encryptString(apiKey)
  } catch (error) {
    log.error('Failed to encrypt API key during save:', error)
    throw error
  }
}

export async function getDecryptedAiKey() {
  const settings = await getSettings()

  if (!settings.ai.apiKey) {
    return undefined
  }

  return decryptString(settings.ai.apiKey)
}
