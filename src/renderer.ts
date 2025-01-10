/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import { ProxyData } from './types'
import './index.tsx'
import { setMonacoEnv } from './components/Monaco/setMonacoEnv'
import * as Sentry from '@sentry/electron/renderer'

setMonacoEnv()

// Sentry integration
if (process.env.NODE_ENV !== 'development') {
  Sentry.init({
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // conditionally send the event based on the user's settings
    beforeSend: async (event) => {
      const { telemetry } = await window.studio.settings.getSettings()
      if (telemetry.errorReport) {
        return event
      }
      return null
    },
  })
}

window.addEventListener('unhandledrejection', (event) => {
  Sentry.captureException(event.reason)
})

// Proxy

window.studio.proxy.onProxyData((_data: ProxyData) => {})
