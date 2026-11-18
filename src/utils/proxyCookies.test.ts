import { execFile } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { beforeAll, describe, expect, it } from 'vitest'

const platforms: Partial<Record<NodeJS.Platform, string>> = {
  darwin: 'mac',
  linux: 'linux',
  win32: 'win',
}
const platform = platforms[process.platform]
if (!platform) throw new Error(`Unsupported platform: ${process.platform}`)
const binary = join(
  process.cwd(),
  'resources',
  platform,
  process.arch === 'x64' ? 'x86_64' : process.arch,
  `k6-studio-proxy${process.platform === 'win32' ? '.exe' : ''}`
)

describe('Proxy response cookie serialization', () => {
  let results: Record<string, unknown>

  beforeAll(async () => {
    const confdir = await mkdtemp(join(tmpdir(), 'studio-proxy-cookies-'))
    try {
      const { stdout } = await promisify(execFile)(
        binary,
        [
          '--set',
          'server=false',
          '--set',
          `confdir=${confdir}`,
          '-s',
          join(process.cwd(), 'src/test/fixtures/proxyCookies.py'),
        ],
        { timeout: 20000 }
      )
      const line = stdout
        .split('\n')
        .find((line) => line.startsWith('COOKIE_RESULTS:'))
      if (!line) throw new Error(`Missing cookie fixture results: ${stdout}`)
      results = JSON.parse(line.slice('COOKIE_RESULTS:'.length)) as Record<
        string,
        unknown
      >
    } finally {
      await rm(confdir, { recursive: true, force: true })
    }
  }, 25000)

  it.each([
    {
      name: 'different',
      cookies: [['sid', 'response']],
      headers: ['sid=response; Path=/; HttpOnly'],
    },
    {
      name: 'duplicates',
      cookies: [
        ['sid', 'first'],
        ['sid', 'second'],
      ],
      headers: ['sid=first; Path=/', 'sid=second; Path=/admin; Secure'],
    },
    {
      name: 'empty',
      cookies: [['sid', '']],
      headers: ['sid=; Max-Age=0; Path=/'],
    },
    { name: 'absent', cookies: [], headers: [] },
  ])('serializes $name response cookies', ({ name, cookies, headers }) => {
    expect(results[name]).toEqual({
      requestCookies: [['old', 'request']],
      responseCookies: cookies,
      responseHeaders: [
        ...headers.map((value) => ['Set-Cookie', value]),
        ['content-length', '2'],
      ],
    })
  })
})
