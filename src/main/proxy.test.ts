import { describe, expect, it, vi } from 'vitest'

import { ProxySettings } from '../types/settings'

import { buildProxyArgs } from './proxy'

vi.mock('electron', () => ({
  app: { getAppPath: vi.fn(), getPath: vi.fn() },
  BrowserWindow: vi.fn(),
}))

vi.mock('electron-log/main', () => ({
  default: { error: vi.fn() },
}))

vi.mock('find-process', () => ({
  default: vi.fn(),
}))

vi.mock('tree-kill', () => ({
  default: vi.fn(),
}))

const regularSettings: ProxySettings = {
  mode: 'regular',
  port: 6000,
  automaticallyFindPort: true,
  sslInsecure: false,
}

const options = {
  proxyScript: '/resources/json_output.py',
  certificatesPath: '/resources/certificates',
}

describe('buildProxyArgs', () => {
  it('builds args for regular mode', () => {
    expect(buildProxyArgs(regularSettings, options)).toEqual([
      '-q',
      '-s',
      '/resources/json_output.py',
      '--set',
      'confdir=/resources/certificates',
      '--listen-port',
      '6000',
      '--mode',
      'regular',
      '--set',
      'validate_inbound_headers=false',
      '--set',
      'connection_strategy=lazy',
    ])
  })

  it('appends --ssl-insecure when enabled', () => {
    const args = buildProxyArgs(
      { ...regularSettings, sslInsecure: true },
      options
    )

    expect(args).toContain('--ssl-insecure')
  })

  it('builds upstream mode with auth', () => {
    const args = buildProxyArgs(
      {
        mode: 'upstream',
        port: 6000,
        automaticallyFindPort: true,
        sslInsecure: false,
        url: 'http://upstream:8080',
        requiresAuth: true,
        username: 'user',
        password: 'pass',
      },
      options
    )

    expect(args).toContain('upstream:http://upstream:8080')
    expect(args).toContain('--upstream-auth')
    expect(args).toContain('user:pass')
  })
})
