// Import shims first to mutate k6 modules globally
import './shims/http'
import './shims/browser'

// @ts-expect-error - Path will be replaced at runtime
// eslint-disable-next-line import/no-unresolved
import * as userScript from '__USER_SCRIPT_PATH__'
import type { Options } from 'k6/options'

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
const userOptions: Options | undefined = userScript.options
const userScenarios = userOptions?.scenarios

const selectedScenario = __ENV.SCENARIO_NAME
  ? userScenarios?.[__ENV.SCENARIO_NAME]
  : undefined

const selectedExec = selectedScenario?.exec ?? 'default'

export const options: Options = {
  scenarios: {
    default: {
      // Always use 1 VU, 1 iteration in the debugger
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 1,
      exec: 'default',
      options: selectedScenario?.options,
    },
  },
}

export default async function () {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
  const fn = userScript[selectedExec]

  if (typeof fn !== 'function') {
    throw new Error(`No exported function "${selectedExec}" found in script`)
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await fn()
}

export { handleSummary } from './summary'
