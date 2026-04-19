import { Check, LogEntry } from '@/schemas/k6'
import { ProxyData } from '@/types'

import { persistValidatorHttpTraffic } from './persistValidatorHttpTraffic'
import { processProxyData } from './proxyData'

export type RunValidatorSessionOptions =
  | {
      mode: 'inline'
      script: string
      /** Defaults to true (telemetry). */
      shouldTrack?: boolean
      /** Folder label under Validator runs (default: `Agent`). */
      runSourceLabel?: string
      signal?: AbortSignal
    }
  | {
      mode: 'path'
      /** Workspace-relative `.js` name or absolute path (same as Validator). */
      scriptPath: string
      runSourceLabel?: string
      signal?: AbortSignal
    }

export interface ValidatorSessionResult {
  proxyData: ProxyData[]
  logs: LogEntry[]
  checks: Check[]
}

function defaultLabelForScriptPath(scriptPath: string): string {
  const base = scriptPath.split(/[/\\]/).pop() ?? 'Validator'
  const withoutExt = base.replace(/\.js$/i, '')
  return withoutExt.length > 0 ? withoutExt : 'Validator'
}

/**
 * Runs k6 through the same instrumentation and proxy pipeline as Validator,
 * then resolves with captured HTTP traffic, k6 logs, and checks.
 *
 * Intended for programmatic use (including AI agents via `evaluate_script`).
 */
export async function runValidatorSession(
  options: RunValidatorSessionOptions
): Promise<ValidatorSessionResult> {
  let collectedData: ProxyData[] = []
  const logs: LogEntry[] = []
  let checks: Check[] = []

  return new Promise((resolve, reject) => {
    let unsubscribeProxyData = () => {}
    let unsubscribeLogs = () => {}
    let unsubscribeChecks = () => {}
    let unsubscribeFinished = () => {}
    let unsubscribeFailed = () => {}

    const cleanup = () => {
      unsubscribeProxyData()
      unsubscribeLogs()
      unsubscribeChecks()
      unsubscribeFinished()
      unsubscribeFailed()
    }

    let startedAtMs = 0
    const sourceLabel =
      options.runSourceLabel ??
      (options.mode === 'path'
        ? defaultLabelForScriptPath(options.scriptPath)
        : 'Agent')

    if (options.signal) {
      options.signal.addEventListener('abort', () => {
        void persistValidatorHttpTraffic(
          collectedData,
          sourceLabel,
          startedAtMs || Date.now(),
          undefined,
          logs
        )
        cleanup()
        window.studio.script.stopScript()
        reject(new DOMException('Aborted', 'AbortError'))
      })
    }

    unsubscribeProxyData = window.studio.proxy.onProxyData((data) => {
      collectedData = processProxyData(collectedData, data)
    })

    unsubscribeLogs = window.studio.script.onScriptLog((entry) => {
      logs.push(entry)
    })

    unsubscribeChecks = window.studio.script.onScriptCheck((next) => {
      checks = next
    })

    unsubscribeFinished = window.studio.script.onScriptFinished(() => {
      void persistValidatorHttpTraffic(
        collectedData,
        sourceLabel,
        startedAtMs,
        undefined,
        logs
      )
      cleanup()
      resolve({ proxyData: collectedData, logs, checks })
    })

    unsubscribeFailed = window.studio.script.onScriptFailed(() => {
      void persistValidatorHttpTraffic(
        collectedData,
        sourceLabel,
        startedAtMs,
        undefined,
        logs
      )
      cleanup()
      reject(new Error('k6 validation run failed'))
    })

    startedAtMs = Date.now()
    const runPromise =
      options.mode === 'inline'
        ? window.studio.script.runScriptFromGenerator(
            options.script,
            options.shouldTrack ?? true
          )
        : window.studio.script.runScript(options.scriptPath)

    runPromise.catch((error: unknown) => {
      cleanup()
      reject(error)
    })
  })
}
