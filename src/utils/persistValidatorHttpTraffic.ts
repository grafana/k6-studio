import { INVALID_FILENAME_CHARS } from '@/constants/files'
import { BrowserActionEvent, BrowserReplayEvent } from '@/main/runner/schema'
import { LogEntry } from '@/schemas/k6'
import { ValidatorBrowserPersist } from '@/schemas/recording'
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
  startedAtMs: number,
  browser?: {
    actions: BrowserActionEvent[]
    replay: BrowserReplayEvent[]
  },
  logs?: LogEntry[]
): Promise<string | undefined> {
  if (proxyData.length === 0) {
    return undefined
  }

  const logEntries = logs ?? []
  const hasBrowser =
    browser !== undefined &&
    (browser.actions.length > 0 || browser.replay.length > 0)

  let validatorBrowser: ValidatorBrowserPersist | undefined
  if (hasBrowser || logEntries.length > 0) {
    validatorBrowser = {
      version: '2',
      actions: browser?.actions ?? [],
      replay: browser?.replay ?? [],
      logs: logEntries,
    }
  }

  const har = proxyDataToHar(proxyData, [], validatorBrowser)

  return window.studio.validatorRun.saveSession(
    har,
    sanitizeRunSourceLabel(runSourceLabel),
    startedAtMs
  )
}
