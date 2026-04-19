import { INVALID_FILENAME_CHARS } from '@/constants/files'
import { ProxyData } from '@/types'

import { proxyDataToHar } from './proxyDataToHar'

function sanitizeRunSourceLabel(label: string) {
  const trimmed = label.replace(INVALID_FILENAME_CHARS, '_').trim()
  return trimmed.slice(0, 120) || 'Validator run'
}

/**
 * Saves HTTP traffic under `Validator runs/<source>/<YYYY-MM-DD>/<HH-mm-ss>.har`.
 * `runSourceLabel` is the generator or script name used for the first folder segment.
 */
export async function persistValidatorHttpTraffic(
  proxyData: ProxyData[],
  runSourceLabel: string,
  startedAtMs: number
): Promise<string | undefined> {
  if (proxyData.length === 0) {
    return undefined
  }

  const har = proxyDataToHar(proxyData, [])

  return window.studio.validatorRun.saveSession(
    har,
    sanitizeRunSourceLabel(runSourceLabel),
    startedAtMs
  )
}
