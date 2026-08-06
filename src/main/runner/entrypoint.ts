// Import shims first to mutate k6 modules globally
import './shims/http'
import './shims/browser'
// @ts-expect-error - Path will be replaced at runtime
// eslint-disable-next-line import/no-unresolved
import * as untypedScript from '__USER_SCRIPT_PATH__'
import type { Options } from 'k6/options'

import {
  drainReplayEvents,
  flushReplayEvents,
} from './shims/browser/replayDrain'
import { TRACKING_SERVER_URL } from './shims/utils'
import { configureOptions, getDebugTarget } from './utils'

// Keeps the loss from navigations the browser proxy can't see bounded
const REPLAY_DRAIN_INTERVAL = 300

const userScript = untypedScript as Record<string, () => Promise<void>> & {
  options?: Options
}

const userOptions = userScript.options ?? {}
const target = getDebugTarget(userOptions, __ENV.SCENARIO_NAME)

export const options = configureOptions(userOptions, target)

export default async function () {
  const exec = target?.exec ?? 'default'

  if (exec === undefined) {
    throw new Error('No scenario found to execute')
  }

  if (typeof userScript[exec] !== 'function') {
    throw new Error(
      `The specified exec function "${exec}" is not defined in the script`
    )
  }

  // Link clicks, form submits and waitForNavigation destroy the document
  // without going through a proxied method, so replay events are also pulled
  // on a timer for as long as the script runs.
  const drainInterval =
    TRACKING_SERVER_URL === null
      ? null
      : setInterval(() => {
          void drainReplayEvents()
        }, REPLAY_DRAIN_INTERVAL)

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await userScript[exec]()
  } finally {
    if (drainInterval !== null) {
      clearInterval(drainInterval)

      await flushReplayEvents()
    }
  }
}

export { handleSummary } from './summary'
