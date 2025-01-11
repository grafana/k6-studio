import * as SentryRenderer from '@sentry/electron/renderer'
import { AppSettings } from './types/settings'

export function configureRendererProcess(
  getSettingsFn?: () => Promise<AppSettings>
) {
  if (process.env.NODE_ENV !== 'development') {
    SentryRenderer.init({
      integrations: [
        SentryRenderer.browserTracingIntegration(),
        SentryRenderer.replayIntegration(),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

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
