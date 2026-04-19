import { ProxyData } from '@/types'

import { persistValidatorHttpTraffic } from './persistValidatorHttpTraffic'
import { processProxyData } from './proxyData'

/**
 * Validates a k6 script by running it and collecting proxy data
 * @param runSourceLabel Generator name (no extension) used when persisting HTTP traffic
 */
export async function validateScript(
  script: string,
  signal?: AbortSignal,
  shouldTrack = true,
  runSourceLabel?: string
): Promise<ProxyData[]> {
  let collectedData: ProxyData[] = []

  return new Promise((resolve, reject) => {
    let unsubscribeProxyData = () => {}
    let unsubscribeScriptFinished = () => {}
    let unsubscribeScriptFailed = () => {}

    // Cleanup function to remove all listeners
    const cleanup = () => {
      unsubscribeProxyData()
      unsubscribeScriptFinished()
      unsubscribeScriptFailed()
    }

    let startedAtMs = 0
    const sourceLabel = runSourceLabel ?? 'Generator'

    // Handle abort signal
    if (signal) {
      signal.addEventListener('abort', () => {
        void persistValidatorHttpTraffic(
          collectedData,
          sourceLabel,
          startedAtMs || Date.now()
        )
        cleanup()
        window.studio.script.stopScript()
        reject(new DOMException('Aborted', 'AbortError'))
      })
    }

    // Set up proxy data listener
    unsubscribeProxyData = window.studio.proxy.onProxyData((data) => {
      const processedData = processProxyData(collectedData, data)
      collectedData = processedData
    })

    // Set up script finished listener
    unsubscribeScriptFinished = window.studio.script.onScriptFinished(() => {
      void persistValidatorHttpTraffic(
        collectedData,
        sourceLabel,
        startedAtMs
      )
      cleanup()
      resolve(collectedData)
    })

    // Set up script failed listener
    unsubscribeScriptFailed = window.studio.script.onScriptFailed(() => {
      void persistValidatorHttpTraffic(
        collectedData,
        sourceLabel,
        startedAtMs
      )
      cleanup()
      reject(new Error('Script validation failed'))
    })

    // Run the script (capture initiation time immediately before starting k6)
    startedAtMs = Date.now()
    window.studio.script
      .runScriptFromGenerator(script, shouldTrack)
      .catch((error) => {
        cleanup()
        reject(error)
      })
  })
}
