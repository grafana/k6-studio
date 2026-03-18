import { useInBrowserSettings } from 'src/browser-script/frontend/view/SettingsProvider'
import { InBrowserSettings } from 'src/browser-script/messaging/types'

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
