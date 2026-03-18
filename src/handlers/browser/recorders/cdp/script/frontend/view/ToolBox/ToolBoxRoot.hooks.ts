import { useInBrowserSettings } from 'src/handlers/browser/recorders/cdp/script/frontend/view/SettingsProvider'
import { InBrowserSettings } from 'src/handlers/browser/recorders/cdp/script/messaging/types'

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
