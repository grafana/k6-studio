import {
  test,
  expect,
  chromium,
  type CDPSession,
  type Page,
} from '@playwright/test'
import { execFile } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { build } from 'vite'
import { WebSocketServer } from 'ws'
import { z } from 'zod'

import { attachFramePaths } from './cdp'
import { EnvelopeSchema, decodeMessage } from './messages'
import { startOriginMock } from './server'

const MessageSchema = z.object({
  data: z
    .object({
      type: z.string(),
      events: z
        .array(
          z.object({
            type: z.string(),
            frames: z.array(z.unknown()).optional(),
          })
        )
        .optional(),
    })
    .optional(),
})
type RecordedMessage = z.infer<typeof MessageSchema>

const modes = [
  'current',
  'secure',
  'secure-late-injection',
  'secure-explicit-grant',
  'forced-origin',
] as const
type Mode = (typeof modes)[number]
const worldName = 'k6-studio-recorder'
const output = mkdtempSync(join(tmpdir(), 'k6-origin-build-'))
let source: string

function disablesSecurity(mode: Mode) {
  return mode === 'current' || mode === 'forced-origin'
}

function framePaths(messages: RecordedMessage[]) {
  return messages
    .flatMap((message) => message.data?.events ?? [])
    .filter((event) => event.type === 'click')
    .map((event) => event.frames?.length ?? 0)
}

test.beforeAll(async () => {
  await build({
    configFile: 'vite.browser.config.ts',
    logLevel: 'error',
    build: { outDir: `${output}/browser` },
  })
  await build({
    configFile: 'vite.replay.config.ts',
    logLevel: 'error',
    build: { outDir: output },
  })
  source = await readFile(`${output}/browser/index.js`, 'utf8')
})

test.afterAll(async () => {
  await rm(output, { recursive: true, force: true })
})

async function injectRecorder(page: Page, messages: RecordedMessage[]) {
  const cdp = await page.context().newCDPSession(page)
  const paths = attachFramePaths(cdp, (events) =>
    messages.push({ data: { type: 'record-events', events } })
  )
  await paths.attach()
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Page.setBypassCSP', { enabled: true })
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
    source: 'window.__K6_STUDIO_TAB_ID__ = "mock"',
    worldName,
    runImmediately: true,
  })
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
    source,
    worldName,
    runImmediately: true,
  })
  return cdp
}

async function grantFrameAccess(cdp: CDPSession) {
  const { frameTree } = await cdp.send('Page.getFrameTree')
  const grant = async (tree: typeof frameTree): Promise<void> => {
    await cdp.send('Page.createIsolatedWorld', {
      frameId: tree.frame.id,
      worldName,
      grantUniveralAccess: true,
    })
    await Promise.all((tree.childFrames ?? []).map(grant))
  }
  await grant(frameTree)
}

async function checkLogin(
  page: Page,
  mock: Awaited<ReturnType<typeof startOriginMock>>,
  mode: Mode
) {
  await page.locator('#login').click()
  await expect(page.locator('#result')).toHaveText(
    mode === 'current' ? '400' : '200'
  )
  expect(
    mock.requests.find((request) => request.method === 'POST')?.origin
  ).toBe(mode === 'current' ? undefined : mock.app)
  const mainCanReadChild = await page.evaluate(() => {
    try {
      return Boolean(window.frames[0]!.document)
    } catch {
      return false
    }
  })
  expect(mainCanReadChild).toBe(disablesSecurity(mode))
}

async function checkFrames(page: Page, messages: RecordedMessage[]) {
  await page.frameLocator('#cross').locator('#child').click()
  await page
    .frameLocator('#cross')
    .frameLocator('#nested')
    .locator('#child')
    .click()
  await page.frameLocator('#sandbox').locator('#child').click()
  // Every mode must retain the top, cross-origin, nested, and sandboxed clicks.
  await expect.poll(() => framePaths(messages)).toEqual([0, 1, 2, 1])
}

async function checkCors(page: Page, api: string, mode: Mode) {
  const denied = await page.evaluate(async (api) => {
    try {
      await fetch(`${api}/token-denied`, { method: 'POST', body: 'mock' })
      return 'allowed'
    } catch {
      return 'blocked'
    }
  }, api)
  expect(denied).toBe(disablesSecurity(mode) ? 'allowed' : 'blocked')
  const preflightStatus = await page.evaluate(async (api) => {
    const response = await fetch(`${api}/token-json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
    return response.status
  }, api)
  expect(preflightStatus).toBe(mode === 'current' ? 400 : 200)
  return denied
}

for (const mode of modes) {
  test(`Recorder: ${mode}`, async () => {
    const mock = await startOriginMock()
    const messages: RecordedMessage[] = []
    const socket = new WebSocketServer({ port: 7554, host: '127.0.0.1' })
    socket.on('connection', (client) =>
      client.on('message', (data) => {
        const message = MessageSchema.parse(JSON.parse(decodeMessage(data)))
        messages.push(message)
        if (
          message.data?.type === 'load-tool-state' ||
          message.data?.type === 'sync-tool-state'
        ) {
          const envelope = EnvelopeSchema.parse(JSON.parse(decodeMessage(data)))
          envelope.data!.type =
            message.data.type === 'load-tool-state'
              ? 'tool-state-request'
              : 'tool-state-update'
          socket.clients.forEach((peer) => peer.send(JSON.stringify(envelope)))
        }
      })
    )
    try {
      await runRecorder(mock, messages, mode)
    } finally {
      socket.clients.forEach((client) => client.terminate())
      await new Promise<void>((resolve) => socket.close(() => resolve()))
      await new Promise<void>((resolve, reject) =>
        mock.server.close((error) => (error ? reject(error) : resolve()))
      )
    }
  })
}

async function runRecorder(
  mock: Awaited<ReturnType<typeof startOriginMock>>,
  messages: RecordedMessage[],
  mode: Mode
) {
  const browser = await chromium.launch({
    channel: 'chrome',
    args: [
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-site-isolation-trials',
      ...(disablesSecurity(mode) ? ['--disable-web-security'] : []),
    ],
  })
  try {
    const page = await browser.newPage()
    if (mode === 'secure-late-injection') {
      await page.goto(mock.app)
      // The recorder must use its own world's built-ins, even after the page loads.
      await Promise.all(
        page
          .frames()
          .slice(1)
          .map((frame) =>
            frame.evaluate(() => {
              const blocked = () => {
                throw new Error('Page replaced this built-in')
              }
              Object.defineProperty(window, 'Map', {
                value: blocked,
                configurable: true,
              })
              Object.defineProperty(window, 'Set', {
                value: blocked,
                configurable: true,
              })
            })
          )
      )
    }
    const cdp = await injectRecorder(page, messages)
    if (mode === 'forced-origin') {
      await cdp.send('Network.enable')
      await cdp.send('Network.setExtraHTTPHeaders', {
        headers: { Origin: mock.app },
      })
    }
    if (mode !== 'secure-late-injection') await page.goto(mock.app)
    if (mode === 'secure-explicit-grant') await grantFrameAccess(cdp)
    await checkLogin(page, mock, mode)
    await checkFrames(page, messages)
    const denied = await checkCors(page, mock.api, mode)
    expect(mock.requests.some((request) => request.method === 'OPTIONS')).toBe(
      !disablesSecurity(mode)
    )
    console.log(
      JSON.stringify({
        mode,
        chrome: browser.version(),
        requests: mock.requests,
        framePaths: framePaths(messages),
        denied,
      })
    )
  } finally {
    await browser.close()
  }
}

for (const disableWebSecurity of [true, false]) {
  test(`Validator: disable-web-security=${disableWebSecurity}`, async () => {
    const mock = await startOriginMock()
    try {
      const { stderr } = await promisify(execFile)(
        'k6',
        ['run', 'scripts/repro-origin/validator.js'],
        {
          timeout: 25_000,
          env: {
            ...process.env,
            MOCK_URL: mock.app,
            REPLAY_PATH: `${output}/replay.js`,
            EXPECT_STATUS: disableWebSecurity ? '400' : '200',
            K6_BROWSER_HEADLESS: 'true',
            K6_BROWSER_ARGS: [
              'disable-features=site-per-process',
              'disable-site-isolation-trials',
              ...(disableWebSecurity ? ['disable-web-security'] : []),
            ].join(','),
          },
        }
      )
      console.log(
        stderr
          .split('\n')
          .filter((line) => line.includes('MOCK_RESULT'))
          .join('\n')
      )
      expect(
        mock.requests.find((request) => request.method === 'POST')?.origin
      ).toBe(disableWebSecurity ? undefined : mock.app)
    } finally {
      await new Promise<void>((resolve, reject) =>
        mock.server.close((error) => (error ? reject(error) : resolve()))
      )
    }
  })
}
