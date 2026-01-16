// Import shims first to mutate k6 modules globally
import './shims/http'
import './shims/browser'

// @ts-expect-error - Path will be replaced at runtime
import * as userScript from '__USER_SCRIPT_PATH__'
import type { Options } from 'k6/options'

const DEFAULT_SCENARIOS: Options['scenarios'] = {
  default: {
    executor: 'per-vu-iterations',
    exec: 'default',
  },
}

const scenarios: Required<Options>['scenarios'] = Object.fromEntries(
  Object.entries(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (userScript.options as Options)?.scenarios ?? DEFAULT_SCENARIOS
  ).map(([name, scenario]) => {
    return [
      name,
      {
        // Always use 1 VU, 1 iteration in the debugger
        executor: 'per-vu-iterations',
        vus: 1,
        iterations: 1,
        exec: scenario.exec ?? 'default',
        // Make sure the browser options are carried over
        options: scenario.options,
      },
    ]
  })
)

export const options: Options = {
  scenarios,
}

export default async function () {
  // Always prefer the 'default' export if configured, otherwise fallback to the
  // first scenario.
  const exec = Object.values(scenarios).find(({ exec }) => exec === 'default')
    ? 'default'
    : Object.values(scenarios)[0]?.exec
  if (exec === undefined) {
    throw new Error('No scenario found to execute')
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  await userScript[exec]()
}

export { handleSummary } from './summary'
