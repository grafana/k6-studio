import { useInBrowserSettings } from 'extension/src/frontend/view/SettingsProvider'
import { InBrowserSettings } from 'extension/src/messaging/types'

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
