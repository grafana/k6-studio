import type { ProxyData } from '@/types'

import { runValidatorSession } from './runValidatorSession'

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
  const { proxyData } = await runValidatorSession({
    mode: 'inline',
    script,
    shouldTrack,
    runSourceLabel: runSourceLabel ?? 'Generator',
    signal,
  })
  return proxyData
}
