import { ProxyData } from '@/types'

import { processProxyData } from './proxyData'

/**
 * Validates a k6 script by running it and collecting proxy data
 */
export async function validateScript(script: string): Promise<ProxyData[]> {
  let collectedData: ProxyData[] = []

  return new Promise((resolve, reject) => {
    let unsubscribeProxyData: (() => void) | null = null
    let unsubscribeScriptFinished: (() => void) | null = null
    let unsubscribeScriptFailed: (() => void) | null = null

    // Cleanup function to remove all listeners
    const cleanup = () => {
      if (unsubscribeProxyData) {
        unsubscribeProxyData()
        unsubscribeProxyData = null
      }
      if (unsubscribeScriptFinished) {
        unsubscribeScriptFinished()
        unsubscribeScriptFinished = null
      }
      if (unsubscribeScriptFailed) {
        unsubscribeScriptFailed()
        unsubscribeScriptFailed = null
      }
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
