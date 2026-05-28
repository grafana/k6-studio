import { AppSettings } from '@/types/settings'
import { toNativePath, toPosixPath } from '@/utils/path'

function convertPaths(
  settings: AppSettings,
  convert: (p: string) => string
): AppSettings {
  return {
    ...settings,
    recorder:
      !settings.recorder.detectBrowserPath && settings.recorder.browserPath
        ? {
            ...settings.recorder,
            browserPath: convert(settings.recorder.browserPath),
          }
        : settings.recorder,
    proxy:
      settings.proxy.mode === 'upstream' && settings.proxy.certificatePath
        ? {
            ...settings.proxy,
            certificatePath: convert(settings.proxy.certificatePath),
          }
        : settings.proxy,
  }
}

export function settingsToFormValues(settings: AppSettings | undefined) {
  return settings ? convertPaths(settings, toNativePath) : settings
}

export function formValuesToSettings(data: AppSettings): AppSettings {
  return convertPaths(data, toPosixPath)
}
