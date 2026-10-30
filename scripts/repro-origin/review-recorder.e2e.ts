import { chromium, expect, test } from '@playwright/test'
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm, symlink } from 'node:fs/promises'
import { createServer, type Server } from 'node:http'
import { builtinModules, createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { build } from 'vite'
import { WebSocketServer } from 'ws'

import { EnvelopeSchema, decodeMessage } from './messages'
import type { BrowserSession as RecorderSession } from './session'

type Mode = 'secure' | 'legacy' | 'no-recorder'
type Click = {
  type: string
  target?: { selectors: { css: string } }
  frames?: Array<{ selectors: { css: string } }>
}

const attempts = 10
let output: string
let source: string
let sessionModule: typeof import('./session')

test.beforeAll(async () => {
  output = await mkdtemp(join(tmpdir(), 'k6-review-recorder-'))
  await build({
    configFile: 'vite.browser.config.ts',
    logLevel: 'error',
    build: { outDir: output },
  })
  await build({
    configFile: false,
    logLevel: 'error',
    resolve: { tsconfigPaths: true },
    build: {
      target: 'node24',
      outDir: output,
      emptyOutDir: false,
      lib: {
        entry: resolve('scripts/repro-origin/session.ts'),
        formats: ['cjs'],
        fileName: () => 'session.cjs',
      },
      rollupOptions: {
        external: [
          'electron',
          'electron-log/main',
          ...builtinModules,
          ...builtinModules.map((name) => `node:${name}`),
        ],
      },
    },
  })
  await symlink(resolve('node_modules'), join(output, 'node_modules'))
  source = await readFile(join(output, 'index.js'), 'utf8')
  sessionModule = createRequire(resolve('package.json'))(
    join(output, 'session.cjs')
  ) as typeof import('./session')
})

test.afterAll(async () => {
  await rm(output, { recursive: true, force: true })
})

async function startFixture(): Promise<{ server: Server; app: string }> {
  const server = createServer((request, response) => {
    const port = (server.address() as { port: number }).port
    const child = `http://127.0.0.1:${port}`
    response.setHeader('Content-Type', 'text/html')

    switch (request.url) {
      case '/owners':
        response.end(`<iframe id="outer" src="${child}/outer"></iframe>`)
        return
      case '/outer':
        response.end(`<iframe id="before" src="${child}/inner"></iframe>`)
        return
      case '/inner':
        response.end(`<button id="action">Change owner</button><script>
          document.querySelector('#action').addEventListener('click', () => {
            window.frameElement.id = 'after'
          })
        </script>`)
        return
      case '/startup':
        response.end(`<button id="auto">Start</button><script>
          const button = document.querySelector('#auto')
          button.addEventListener('click', () => {
            document.body.dataset.fired = 'yes'
          })
          button.click()
        </script>`)
        return
      case '/startup-top':
        response.end(`<iframe id="cross" src="${child}/startup"></iframe>`)
        return
      default:
        response.statusCode = 404
        response.end('missing')
    }
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = (server.address() as { port: number }).port
  return { server, app: `http://localhost:${port}` }
}

async function withBrowser(
  mode: Mode,
  run: (
    page: import('@playwright/test').Page,
    clicks: Click[],
    app: string
  ) => Promise<void>
) {
  const fixture = await startFixture()
  const profile = await mkdtemp(join(tmpdir(), `k6-review-${mode}-`))
  const hub = new WebSocketServer({ port: 7554, host: '127.0.0.1' })
  hub.on('connection', (socket) =>
    socket.on('message', (bytes) => {
      const message = EnvelopeSchema.parse(JSON.parse(decodeMessage(bytes)))
      if (message.data?.type === 'record-events')
        clicks.push(...(message.data.events ?? []))
      if (
        message.data &&
        ['load-tool-state', 'sync-tool-state'].includes(message.data.type)
      ) {
        message.data.type =
          message.data.type === 'load-tool-state'
            ? 'tool-state-request'
            : 'tool-state-update'
        hub.clients.forEach((peer) => peer.send(JSON.stringify(message)))
      }
    })
  )
  const chrome = spawn(
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    [
      '--headless=new',
      `--user-data-dir=${profile}`,
      '--remote-debugging-port=0',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-back-forward-cache',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-site-isolation-trials',
      ...(mode === 'legacy' ? ['--disable-web-security'] : []),
      'about:blank',
    ],
    { stdio: 'ignore' }
  )
  let recorder: RecorderSession | undefined
  let browser: Awaited<ReturnType<typeof chromium.connectOverCDP>> | undefined
  const clicks: Click[] = []

  try {
    let port = 0
    await expect
      .poll(async () => {
        port = Number(
          (
            await readFile(join(profile, 'DevToolsActivePort'), 'utf8').catch(
              () => '0'
            )
          ).split('\n')[0]
        )
        return port
      })
      .toBeGreaterThan(0)
    if (mode !== 'no-recorder') {
      const transport = await sessionModule.WebSocketTransport.connect({
        port,
        host: '127.0.0.1',
      })
      recorder = await new sessionModule.BrowserSession(
        new sessionModule.ChromeDevToolsClient(transport),
        new sessionModule.Script(source)
      ).attach()
      recorder.on('record', ({ events }) => clicks.push(...events))
    }
    browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`)
    const page = browser.contexts()[0]!.pages()[0]!
    await run(page, clicks, fixture.app)
  } finally {
    recorder?.dispose()
    await browser?.close()
    chrome.kill()
    if (chrome.exitCode === null)
      await new Promise((resolve) => chrome.once('exit', resolve))
    hub.clients.forEach((socket) => socket.terminate())
    await new Promise<void>((resolve) => hub.close(() => resolve()))
    await new Promise<void>((resolve) => fixture.server.close(() => resolve()))
    await rm(profile, { recursive: true, force: true, maxRetries: 5 })
  }
}

for (const mode of ['secure', 'legacy'] as const) {
  test(`review finding 1 owner selector after click: ${mode}`, async () => {
    test.setTimeout(120_000)
    const paths: Array<string[]> = []
    await withBrowser(mode, async (page, clicks, app) => {
      for (let attempt = 0; attempt < attempts; attempt += 1) {
        clicks.length = 0
        await page.goto(`${app}/owners`)
        await expect(
          page.frameLocator('#outer').frameLocator('#before').locator('#action')
        ).toBeVisible()
        expect(
          await page
            .frameLocator('#outer')
            .frameLocator('#after')
            .locator('#action')
            .count()
        ).toBe(0)
        await page
          .frameLocator('#outer')
          .frameLocator('#before')
          .locator('#action')
          .press('Enter')
        await expect
          .poll(() => clicks.filter((event) => event.type === 'click').length)
          .toBe(1)
        const click = clicks.find((event) => event.type === 'click')!
        paths.push(click.frames?.map((frame) => frame.selectors.css) ?? [])
      }
      clicks.length = 0
      await page.goto(`${app}/owners`)
      await page
        .frameLocator('#outer')
        .locator('#before')
        .evaluate((frame) => {
          frame.id = 'current'
        })
      expect(
        await page
          .frameLocator('#outer')
          .frameLocator('#after')
          .locator('#action')
          .count()
      ).toBe(0)
      await page
        .frameLocator('#outer')
        .frameLocator('#current')
        .locator('#action')
        .press('Enter')
      await expect
        .poll(() => clicks.filter((event) => event.type === 'click').length)
        .toBe(1)
      const renamedClick = clicks.find((event) => event.type === 'click')!
      paths.push(renamedClick.frames?.map((frame) => frame.selectors.css) ?? [])
    })
    console.log(`finding1 ${mode} ${JSON.stringify(paths)}`)
    expect(paths).toEqual([
      ...Array.from({ length: attempts }, () => ['#outer', '#before']),
      ['#outer', '#current'],
    ])
  })
}

for (const mode of ['secure', 'legacy', 'no-recorder'] as const) {
  test(`review finding 2 startup click: ${mode}`, async () => {
    test.setTimeout(120_000)
    const results: Array<string | null> = []
    const laterResults: Array<string | null> = []
    await withBrowser(mode, async (page, _clicks, app) => {
      for (let attempt = 0; attempt < attempts; attempt += 1) {
        await page.goto(`${app}/startup-top`)
        results.push(
          await page
            .frameLocator('#cross')
            .locator('body')
            .getAttribute('data-fired')
        )
        await expect
          .poll(async () => {
            await page
              .frameLocator('#cross')
              .locator('#auto')
              .evaluate(() =>
                document.querySelector<HTMLButtonElement>('#auto')?.click()
              )
            return page
              .frameLocator('#cross')
              .locator('body')
              .getAttribute('data-fired')
          })
          .toBe('yes')
        laterResults.push('yes')
      }
    })
    console.log(
      `finding2 ${mode} startup=${JSON.stringify(results)} later=${JSON.stringify(laterResults)}`
    )
    expect(results).toEqual(Array.from({ length: attempts }, () => 'yes'))
    expect(laterResults).toEqual(Array.from({ length: attempts }, () => 'yes'))
  })
}
