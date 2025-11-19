import { ProxyData } from '@/types'

import { processProxyData } from './proxyData'

/**
 * Validates a k6 script by running it and collecting proxy data
 */
export async function validateScript(
  script: string,
  signal?: AbortSignal
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

    // Handle abort signal
    if (signal) {
      signal.addEventListener('abort', () => {
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
      cleanup()
      resolve(collectedData)
    })

    // Set up script failed listener
    unsubscribeScriptFailed = window.studio.script.onScriptFailed(() => {
      cleanup()
      reject(new Error('Script validation failed'))
    })

    // Run the script
    window.studio.script.runScriptFromGenerator(script).catch((error) => {
      cleanup()
      reject(error)
    })
  })
}
