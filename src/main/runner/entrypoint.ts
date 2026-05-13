// Import shims first to mutate k6 modules globally
import './shims/http'
import './shims/browser'

// @ts-expect-error - Path will be replaced at runtime
// eslint-disable-next-line import/no-unresolved
import * as untypedScript from '__USER_SCRIPT_PATH__'
import type { Options } from 'k6/options'

import { configureOptions, getDebugTarget } from './utils'

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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  await userScript[exec]()
}

export { handleSummary } from './summary'
