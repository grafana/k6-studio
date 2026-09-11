import { BrowserLaunchError } from '@/recorder/launchers/types'

/**
 * Switches that settings and launch-time validation always treat as managed by
 * k6 Studio (base launch switches, proxy/CDP transport, and feature conflicts).
 */
export const ALWAYS_MANAGED_BROWSER_SWITCHES = new Set([
  '--new',
  '--args',
  '--hide-crash-restore-bubble',
  '--test-type',
  '--no-default-browser-check',
  '--no-first-run',
  '--disable-background-networking',
  '--disable-component-update',
  '--disable-search-engine-choice-screen',
  '--user-data-dir',
  '--disable-features',
  '--proxy-server',
  '--ignore-certificate-errors-spki-list',
  '--remote-debugging-pipe',
  '--remote-debugging-port',
  '--enable-features',
])

export function getBrowserSwitchName(argument: string): string {
  const separatorIndex = argument.indexOf('=')

  const switchName =
    separatorIndex === -1 ? argument : argument.slice(0, separatorIndex)

  return switchName.toLowerCase()
}

export function findCustomBrowserArgumentError(
  customArgs: readonly string[],
  managedSwitches: ReadonlySet<string>
): string | null {
  for (const argument of customArgs) {
    if (argument === '--') {
      return 'Standalone "--" is not allowed'
    }

    if (!argument.startsWith('--')) {
      return 'Each argument must start with "--"'
    }

    if (argument.includes('\0')) {
      return 'Browser arguments must not contain null characters.'
    }

    const switchName = getBrowserSwitchName(argument)

    if (managedSwitches.has(switchName)) {
      return `The "${switchName}" argument is managed by k6 Studio and cannot be overridden.`
    }
  }

  return null
}

function buildRuntimeManagedSwitches(
  managedArgs: readonly string[]
): Set<string> {
  return new Set([
    ...ALWAYS_MANAGED_BROWSER_SWITCHES,
    ...managedArgs
      .filter((argument) => argument.startsWith('--'))
      .map(getBrowserSwitchName),
  ])
}

/**
 * Validates custom browser launch arguments against reserved switches
 * and the factually managed switches of the current launch path.
 */
export function validateCustomBrowserArguments(
  customArgs: readonly string[],
  managedArgs: readonly string[]
): void {
  const message = findCustomBrowserArgumentError(
    customArgs,
    buildRuntimeManagedSwitches(managedArgs)
  )

  if (message) {
    throw new BrowserLaunchError('invalid-browser-arguments', message)
  }
}
