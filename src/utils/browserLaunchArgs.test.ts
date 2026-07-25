import { describe, expect, it } from 'vitest'

import {
  ALWAYS_MANAGED_BROWSER_SWITCHES,
  BrowserLaunchArgumentsError,
  findCustomBrowserArgumentError,
  getBrowserSwitchName,
  validateCustomBrowserArguments,
} from './browserLaunchArgs'

describe('getBrowserSwitchName', () => {
  it('normalises switch names case-insensitively', () => {
    expect(getBrowserSwitchName('--Proxy-Server=X')).toBe('--proxy-server')
  })
})

describe('findCustomBrowserArgumentError', () => {
  it('allows --proxy-bypass-list=<-loopback>', () => {
    expect(
      findCustomBrowserArgumentError(
        ['--proxy-bypass-list=<-loopback>'],
        ALWAYS_MANAGED_BROWSER_SWITCHES
      )
    ).toBeNull()
  })

  it('rejects arguments without "--" prefix', () => {
    expect(
      findCustomBrowserArgumentError(
        ['no-dash-prefix'],
        ALWAYS_MANAGED_BROWSER_SWITCHES
      )
    ).toBe('Each argument must start with "--"')
  })

  it('rejects --proxy-server', () => {
    expect(
      findCustomBrowserArgumentError(
        ['--proxy-server=http://example.com'],
        ALWAYS_MANAGED_BROWSER_SWITCHES
      )
    ).toContain('managed by k6 Studio')
  })
})

describe('validateCustomBrowserArguments', () => {
  it('rejects a custom switch that conflicts with a runtime-managed switch', () => {
    expect(() =>
      validateCustomBrowserArguments(
        ['--disable-web-security'],
        ['--disable-web-security']
      )
    ).toThrow(BrowserLaunchArgumentsError)
  })

  it('compares switch names case-insensitively', () => {
    expect(() =>
      validateCustomBrowserArguments(
        ['--DISABLE-WEB-SECURITY'],
        ['--disable-web-security']
      )
    ).toThrow(/managed by k6 Studio/)
  })
})
