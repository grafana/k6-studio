import { Options, Scenario } from 'k6/options'

export function getDebugTarget(options: Options, scenarioName?: string) {
  if (scenarioName) {
    return options.scenarios?.[scenarioName]
  }

  const scenarios = Object.values(options.scenarios ?? {})

  // Always prefer the 'default' export if configured, otherwise fallback to the
  // first scenario.
  return (
    scenarios.find(({ exec = 'default' }) => exec === 'default') ?? scenarios[0]
  )
}

export function configureOptions(options: Options, target?: Scenario) {
  return {
    ...options,
    vus: null,
    iterations: null,
    stages: null,
    scenarios: {
      // Even though the user's script might have multiple scenarios, our entrypoint only has one
      // and it should always run 1 iteration with 1 VU.
      default: {
        executor: 'shared-iterations',
        vus: 1,
        iterations: 1,
        exec: 'default',
        // We do, however, need to remember whether the user is using k6/browser or not
        options: target?.options,
      },
    },
  }
}
