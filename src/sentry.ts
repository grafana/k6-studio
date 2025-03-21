import * as SentryRenderer from '@sentry/electron/renderer'

import { AppSettings } from './types/settings'

export function configureRendererProcess(
  getSettingsFn?: () => Promise<AppSettings>
) {
  if (process.env.NODE_ENV !== 'development') {
    SentryRenderer.init({
      // conditionally send the event based on the user's settings
      beforeSend: async (event) => {
        const getSettings = getSettingsFn || window.studio.settings.getSettings
        const { telemetry } = await getSettings()
        if (telemetry.errorReport) {
          return event
        }
        return null
      },
    })

    // attach event listener to catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      SentryRenderer.captureException(event.reason)
    })
  }
}
