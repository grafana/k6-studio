import { test, expect, chromium } from '@playwright/test'
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm, symlink } from 'node:fs/promises'
import { builtinModules, createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { build } from 'vite'
import { WebSocketServer } from 'ws'

import { EnvelopeSchema, decodeMessage } from './messages'
import { startOriginMock } from './server'
import type { BrowserSession as RecorderSession } from './session'

// This uses Studio's actual target attachment and injection, including popups.
test('frame paths survive frame navigation, document.open, immediate clicks and popups', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'k6-origin-lifecycle-'))
  const output = await mkdtemp(join(tmpdir(), 'k6-origin-bundle-'))
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
  const require = createRequire(resolve('package.json'))
  const { BrowserSession, Script, ChromeDevToolsClient, WebSocketTransport } =
    require(join(output, 'session.cjs')) as typeof import('./session')
  const source = await readFile(join(output, 'index.js'), 'utf8')
  const mock = await startOriginMock()
  const events: Array<{
    type: string
    target?: { selectors: { css: string } }
    frames?: Array<{ selectors: { css: string } }>
  }> = []
  const hub = new WebSocketServer({ port: 7554, host: '127.0.0.1' })
  hub.on('connection', (socket) =>
    socket.on('message', (bytes) => {
      const message = EnvelopeSchema.parse(JSON.parse(decodeMessage(bytes)))
      if (message.data?.type === 'record-events')
        events.push(...(message.data.events ?? []))
      if (
        message.data &&
        ['load-tool-state', 'sync-tool-state'].includes(message.data.type)
      ) {
        message.data.type =
          message.data.type === 'load-tool-state'
            ? 'tool-state-request'
            : 'tool-state-update'
        hub.clients.forEach((client) => client.send(JSON.stringify(message)))
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
      'about:blank',
    ],
    { stdio: 'ignore' }
  )
  let recorder: RecorderSession | undefined
  let browser: Awaited<ReturnType<typeof chromium.connectOverCDP>> | undefined
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
    const transport = await WebSocketTransport.connect({
      port,
      host: '127.0.0.1',
    })
    recorder = await new BrowserSession(
      new ChromeDevToolsClient(transport),
      new Script(source)
    ).attach()
    recorder.on('record', ({ events: recorded }) => events.push(...recorded))
    browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`)
    const page = browser.contexts()[0]!.pages()[0]!
    await page.goto(mock.app)
    await page.frameLocator('#cross').locator('#child').click()
    await expect
      .poll(() =>
        events
          .filter((event) => event.type === 'click')
          .map((event) => event.frames?.length)
      )
      .toEqual([1])

    // Replace the DOM without navigation. Studio must re-inject in the same world.
    const child = page.frames().find((frame) => frame.url().endsWith('/child'))!
    await child.evaluate(() => {
      document.open()
      document.write('<button id="replacement">Replacement</button>')
      document.close()
    })
    await child.locator('#replacement').click()
    await expect
      .poll(() => events.filter((event) => event.type === 'click').length)
      .toBe(2)
    expect(
      events.filter((event) => event.type === 'click').at(-1)?.frames?.[0]
        ?.selectors.css
    ).toContain('cross')

    // A fresh context must not reuse the previous document's request state.
    await child.goto(`${mock.api}/nested`)
    await child.locator('#child').click()
    await expect
      .poll(() => events.filter((event) => event.type === 'click').length)
      .toBe(3)

    // Add a frame and act as soon as its button exists.
    await page.evaluate((api) => {
      const frame = document.createElement('iframe')
      frame.id = 'dynamic'
      frame.src = `${api}/nested`
      document.body.prepend(frame)
    }, mock.api)
    await page.frameLocator('#dynamic').locator('#child').click()
    await expect
      .poll(() => events.filter((event) => event.type === 'click').length)
      .toBe(4)
    expect(
      events.filter((event) => event.type === 'click').at(-1)?.frames?.[0]
        ?.selectors.css
    ).toContain('dynamic')

    const popupPromise = page.waitForEvent('popup')
    await page.evaluate(
      (url) => window.open(url, '_blank', 'noopener'),
      mock.app
    )
    const popup = await popupPromise
    await popup
      .frameLocator('#cross')
      .frameLocator('#nested')
      .locator('#child')
      .click()
    await expect
      .poll(() => events.filter((event) => event.type === 'click').length)
      .toBe(5)
    expect(
      events.filter((event) => event.type === 'click').at(-1)?.frames
    ).toHaveLength(2)
    await popup.close()
    await child.evaluate(() => {
      const link = document.createElement('a')
      link.href = '/nested'
      link.id = 'navigate'
      link.textContent = 'Navigate'
      document.body.append(link)
    })
    await child.locator('#navigate').click()
    await expect
      .poll(() => events.filter((event) => event.type === 'click').length)
      .toBe(6)

    const inspect = page.locator(
      'button:has(svg.lucide-square-dashed-mouse-pointer)'
    )
    await inspect.click({ timeout: 5000 })
    await expect(inspect).toHaveAttribute('data-state', 'on')
    await child
      .locator('#child')
      .evaluate((button) =>
        button.addEventListener('click', () =>
          button.setAttribute('data-clicked', 'true')
        )
      )
    await child.locator('#child').press('Enter')
    await expect(child.locator('#child')).not.toHaveAttribute(
      'data-clicked',
      'true'
    )
    expect(events.filter((event) => event.type === 'click')).toHaveLength(6)
    await inspect.click({ timeout: 5000 })
    await expect(inspect).toHaveAttribute('data-state', 'off')
    await expect
      .poll(() => {
        return child.locator('#child').evaluate((button) => {
          const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
          })
          button.dispatchEvent(event)

          return {
            prevented: event.defaultPrevented,
            clicked: button.getAttribute('data-clicked'),
          }
        })
      })
      .toEqual({ prevented: false, clicked: 'true' })
    await expect
      .poll(() => events.filter((event) => event.type === 'click').length)
      .toBe(7)
  } finally {
    recorder?.dispose()
    await browser?.close()
    chrome.kill()
    if (chrome.exitCode === null)
      await new Promise((resolve) => chrome.once('exit', resolve))
    hub.clients.forEach((socket) => socket.terminate())
    await new Promise<void>((resolve) => hub.close(() => resolve()))
    await new Promise<void>((resolve) => mock.server.close(() => resolve()))
    await rm(profile, { recursive: true, force: true, maxRetries: 5 })
    await rm(output, { recursive: true, force: true })
  }
})
