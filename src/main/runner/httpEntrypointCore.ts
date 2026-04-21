// @ts-expect-error - Path will be replaced at runtime
// eslint-disable-next-line import/no-unresolved
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
        options: scenario.options,
      },
    ]
  })
)

export const options: Options = {
  scenarios,
}

export default async function () {
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
