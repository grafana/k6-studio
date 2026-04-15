import { InBrowserSettings } from '@/recorder/browser/messaging/types'
import { useInBrowserSettings } from '@/recorder/browser/view/SettingsProvider'

export function useToolboxSettings() {
  const [settings, setSettings] = useInBrowserSettings()

  function setToolboxSettings(
    settings: InBrowserSettings['toolbox'],
    commit = true
  ) {
    setSettings({ toolbox: settings }, commit)
  }

  return [settings.toolbox, setToolboxSettings] as const
}
