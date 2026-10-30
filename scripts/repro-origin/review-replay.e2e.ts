import {
  test,
  expect,
  chromium,
  type Browser,
  type Page,
} from '@playwright/test'
import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { createServer, type Server } from 'node:http'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { build } from 'vite'

const marker = 'REPLAY_CHILD_MARKER_1399'
const nestedMarker = 'REPLAY_NESTED_MARKER_1399'
const lateMarker = 'REPLAY_LATE_MARKER_1399'
const navigatedMarker = 'REPLAY_NAVIGATED_MARKER_1399'
let bundle: string
let output: string
let headOutput: string
let headRoot: string
let server: Server
let app: string
let api: string
const replayBodies: string[] = []

test.beforeAll(async () => {
  output = await mkdtemp(join(tmpdir(), 'k6-review-replay-'))
  if (process.env.KEEP_REPLAY_OUTPUT === '1')
    console.log(`REPLAY_BUILD ${output}`)
  await build({
    configFile: 'vite.replay.config.ts',
    logLevel: 'error',
    build: { outDir: output },
  })
  bundle = await readFile(join(output, 'replay.js'), 'utf8')
  await build({
    configFile: 'vite.script.config.ts',
    logLevel: 'error',
    build: { outDir: output, emptyOutDir: false },
  })
  const entryScript = await readFile(join(output, 'entrypoint.js'), 'utf8')
  const replayPlaceholder = /var SESSION_REPLAY_SCRIPT = "";/
  if (!replayPlaceholder.test(entryScript)) {
    throw new Error(
      `Missing replay placeholder: ${entryScript.match(/.{0,80}SESSION_REPLAY_SCRIPT.{0,80}/)?.[0]}`
    )
  }
  if (!entryScript.includes('"__USER_SCRIPT_PATH__"')) {
    throw new Error('Missing user-script import in entrypoint bundle')
  }
  await writeFile(
    join(output, 'instrumented.js'),
    entryScript
      .replace(
        replayPlaceholder,
        () => `var SESSION_REPLAY_SCRIPT = ${JSON.stringify(bundle)};`
      )
      .replace(
        '"__USER_SCRIPT_PATH__"',
        JSON.stringify(resolve('scripts/repro-origin/review-popup-k6.js'))
      )
  )
  headOutput = await mkdtemp(join(tmpdir(), 'k6-review-head-'))
  headRoot = await mkdtemp(join(tmpdir(), 'k6-review-head-source-'))
  await promisify(execFile)('bash', [
    '-o',
    'pipefail',
    '-c',
    'git archive 80d4066bfe48f7509391c1dd140176d5cc935161 src package.json tsconfig.json vite.base.config.ts vite.replay.config.ts vite.script.config.ts | tar -x -C "$1"',
    'bash',
    headRoot,
  ])
  await symlink(resolve('node_modules'), join(headRoot, 'node_modules'))
  await build({
    root: headRoot,
    configFile: join(headRoot, 'vite.replay.config.ts'),
    logLevel: 'error',
    build: { outDir: headOutput },
  })
  await build({
    root: headRoot,
    configFile: join(headRoot, 'vite.script.config.ts'),
    logLevel: 'error',
    build: { outDir: headOutput, emptyOutDir: false },
  })
  const headReplay = await readFile(join(headOutput, 'replay.js'), 'utf8')
  const headEntrypoint = await readFile(
    join(headOutput, 'entrypoint.js'),
    'utf8'
  )
  await writeFile(
    join(headOutput, 'instrumented.js'),
    headEntrypoint
      .replace(
        replayPlaceholder,
        () => `var SESSION_REPLAY_SCRIPT = ${JSON.stringify(headReplay)};`
      )
      .replace(
        '"__USER_SCRIPT_PATH__"',
        JSON.stringify(resolve('scripts/repro-origin/review-popup-k6.js'))
      )
  )
  server = createServer((request, response) => {
    if (request.url === '/session-replay') {
      let body = ''
      request.on('data', (chunk) => {
        body += String(chunk)
      })
      request.on('end', () => {
        replayBodies.push(body)
        response.end('ok')
      })
      return
    }
    if (request.url?.startsWith('/track/')) {
      response.end('ok')
      return
    }
    response.setHeader('Content-Type', 'text/html')
    if (request.url === '/delay.js') {
      setTimeout(() => response.end('window.parentParserDone = true'), 1000)
      return
    }
    if (request.url === '/child') {
      response.end(`<p>${marker}</p>`)
      return
    }
    if (request.url === '/late') {
      response.end(`<p>${lateMarker}</p>`)
      return
    }
    if (request.url === '/child-alt') {
      response.end(`<p>${navigatedMarker}</p>`)
      return
    }
    if (request.url === '/child-nested') {
      response.end(
        `<p>${marker}</p><iframe id="nested" src="${app}/nested"></iframe>`
      )
      return
    }
    if (request.url === '/nested') {
      response.end(`<p>${nestedMarker}</p>`)
      return
    }
    if (request.url === '/middle') {
      response.end(`<iframe id="nested" src="${api}/child"></iframe>`)
      return
    }
    if (request.url === '/mixed') {
      response.end(`<iframe id="middle" src="${app}/middle"></iframe>`)
      return
    }
    if (request.url === '/shadow') {
      response.end(`<div id="host"></div><script>
        const root = document.querySelector('#host').attachShadow({mode:'open'});
        root.innerHTML = '<iframe id="shadow-child" src="${api}/child"></iframe>';
      </script>`)
      return
    }
    if (request.url === '/deep') {
      response.end(`<iframe id="outer" src="${api}/deep-child"></iframe>`)
      return
    }
    if (request.url === '/deep-child') {
      response.end(`<iframe id="middle" src="${api}/deep-middle"></iframe>`)
      return
    }
    if (request.url === '/deep-middle') {
      response.end(`<iframe id="great" src="${app}/nested"></iframe>`)
      return
    }
    if (request.url === '/slow') {
      response.end(
        `<iframe id="child" src="${api}/child-nested"></iframe><script src="/delay.js"></script>`
      )
      return
    }
    if (request.url === '/fast') {
      response.end(
        `<iframe id="child" src="${api}/child-nested"></iframe><p>Parent</p>`
      )
      return
    }
    if (request.url === '/popup') {
      response.end(
        `<iframe id="child" src="${api}/child"></iframe><p>Parent</p>`
      )
      return
    }
    response.end(`<a id="open" target="_blank" href="${app}/popup">Open</a>`)
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = (server.address() as { port: number }).port
  app = `http://localhost:${port}`
  api = `http://127.0.0.1:${port}`
})

test.afterAll(async () => {
  if (server) {
    server.closeAllConnections()
    await new Promise<void>((resolve) => server.close(() => resolve()))
  }
  if (process.env.KEEP_REPLAY_OUTPUT !== '1') {
    await rm(output, { recursive: true, force: true })
    await rm(headOutput, { recursive: true, force: true })
    await rm(headRoot, { recursive: true, force: true })
  }
})

function launch(oldFlag: boolean) {
  return chromium.launch({
    executablePath:
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: [
      '--disable-features=site-per-process',
      '--disable-site-isolation-trials',
      ...(oldFlag ? ['--disable-web-security'] : []),
    ],
  })
}

function parseBatch(payload: string | undefined) {
  if (!payload) throw new Error('No replay batch')
  const first = payload.indexOf('\n')
  const second = payload.indexOf('\n', first + 1)
  return JSON.parse(payload.slice(second + 1)) as Array<{
    type: number
    data: { isAttachIframe?: boolean }
  }>
}

async function drain(page: Page) {
  const payload = await page.evaluate(() =>
    (
      window as unknown as {
        __K6_DRAIN_EVENTS__?: (received: Record<string, number>) => string
      }
    ).__K6_DRAIN_EVENTS__?.({})
  )
  return parseBatch(payload)
}

async function injectTop(page: Page) {
  await page.evaluate((source) => {
    const replayWindow = window as unknown as {
      __K6_SESSION_REPLAY_TRACKING_SERVER_URL__: string
    }
    replayWindow.__K6_SESSION_REPLAY_TRACKING_SERVER_URL__ =
      'http://localhost:0'
    ;(0, eval)(source)
  }, bundle)
}

async function slowParentCase(browser: Browser, slow: boolean) {
  const context = await browser.newContext()
  await context.addInitScript(
    'window.__K6_SESSION_REPLAY_TRACKING_SERVER_URL__ = "http://localhost:0"'
  )
  await context.addInitScript(bundle)
  const page = await context.newPage()
  try {
    await page.goto(`${app}/${slow ? 'slow' : 'fast'}`)
    await expect(page.frameLocator('#child').locator('p')).toHaveText(marker)
    await expect(
      page.frameLocator('#child').frameLocator('#nested').locator('p')
    ).toHaveText(nestedMarker)
    await page.waitForTimeout(250)
    const events = await drain(page)
    return {
      markerCount: JSON.stringify(events).split(marker).length - 1,
      nestedCount: JSON.stringify(events).split(nestedMarker).length - 1,
      attachments: events.filter((event) => event.data?.isAttachIframe).length,
      events: events.length,
    }
  } finally {
    await context.close()
  }
}

test('slow parent records child and nested snapshots with fast and old-flag controls', async () => {
  const secure = await launch(false)
  const old = await launch(true)
  try {
    const results = {
      secureSlow: [
        await slowParentCase(secure, true),
        await slowParentCase(secure, true),
        await slowParentCase(secure, true),
      ],
      secureFast: await slowParentCase(secure, false),
      oldSlow: await slowParentCase(old, true),
    }
    console.log(`SLOW_PARENT_RESULTS ${JSON.stringify(results)}`)
    expect(results.secureSlow.every((result) => result.markerCount > 0)).toBe(
      true
    )
    expect(results.secureSlow.every((result) => result.nestedCount > 0)).toBe(
      true
    )
    expect(results.secureFast.markerCount).toBeGreaterThan(0)
    expect(results.oldSlow.markerCount).toBeGreaterThan(0)
  } finally {
    await secure.close()
    await old.close()
  }
})

test('rrweb Replayer renders the slow parent child and nested documents', async () => {
  const browser = await launch(false)
  const context = await browser.newContext()
  await context.addInitScript(
    'window.__K6_SESSION_REPLAY_TRACKING_SERVER_URL__ = "http://localhost:0"'
  )
  await context.addInitScript(bundle)
  const page = await context.newPage()
  try {
    await page.goto(`${app}/slow`)
    await expect(
      page.frameLocator('#child').frameLocator('#nested').locator('p')
    ).toHaveText(nestedMarker)
    const events = await drain(page)
    const player = await browser.newPage()
    try {
      await player.setContent('<div id="root"></div>')
      await player.addScriptTag({
        path: resolve('node_modules/rrweb/dist/rrweb.umd.min.cjs'),
      })
      await player.evaluate((events) => {
        const rrweb = (
          window as unknown as {
            rrweb: {
              Replayer: new (
                events: unknown[],
                options: { root: Element }
              ) => { play: () => void }
            }
          }
        ).rrweb
        new rrweb.Replayer(events, {
          root: document.querySelector('#root')!,
        }).play()
      }, events)

      const rendered = () =>
        player.evaluate(() => {
          const textInFrames = (root: Document): string[] =>
            [...root.querySelectorAll('iframe')].flatMap((frame) => {
              const child = frame.contentDocument
              return child
                ? [child.body?.textContent ?? '', ...textInFrames(child)]
                : []
            })
          return textInFrames(document).join('\n')
        })
      await expect
        .poll(async () => (await rendered()).includes(nestedMarker))
        .toBe(true)
      expect(await rendered()).toContain(marker)
      console.log(
        `REPLAYER_SLOW_RESULTS child=true nested=true events=${events.length}`
      )
    } finally {
      await player.close()
    }
  } finally {
    await context.close()
    await browser.close()
  }
})

test('records a cross-origin grandchild under a same-origin middle and a late iframe', async () => {
  const browser = await launch(false)
  const context = await browser.newContext()
  await context.addInitScript(
    'window.__K6_SESSION_REPLAY_TRACKING_SERVER_URL__ = "http://localhost:0"'
  )
  await context.addInitScript(bundle)
  const page = await context.newPage()
  try {
    await page.goto(`${app}/mixed`)
    await expect(
      page.frameLocator('#middle').frameLocator('#nested').locator('p')
    ).toHaveText(marker)
    await page.evaluate((url) => {
      const iframe = document.createElement('iframe')
      iframe.id = 'late'
      iframe.src = url
      document.body.append(iframe)
    }, `${api}/child`)
    await expect(page.frameLocator('#late').locator('p')).toHaveText(marker)
    await page.waitForTimeout(250)
    const events = await drain(page)
    const results = {
      markerCount: JSON.stringify(events).split(marker).length - 1,
      attachments: events.filter((event) => event.data?.isAttachIframe).length,
      events: events.length,
    }
    console.log(`MIXED_DYNAMIC_RESULTS ${JSON.stringify(results)}`)
    expect(results.markerCount).toBeGreaterThanOrEqual(2)
    expect(results.attachments).toBeGreaterThanOrEqual(2)
  } finally {
    await context.close()
    await browser.close()
  }
})

test('records a cross-origin iframe inside an open shadow root', async () => {
  const browser = await launch(false)
  const context = await browser.newContext()
  await context.addInitScript(
    'window.__K6_SESSION_REPLAY_TRACKING_SERVER_URL__ = "http://localhost:0"'
  )
  await context.addInitScript(bundle)
  const page = await context.newPage()
  try {
    await page.goto(`${app}/shadow`)
    await expect(
      page.locator('#host').locator('#shadow-child').contentFrame().locator('p')
    ).toHaveText(marker)
    await page.waitForTimeout(250)
    const events = await drain(page)
    const results = {
      markerCount: JSON.stringify(events).split(marker).length - 1,
      attachments: events.filter((event) => event.data?.isAttachIframe).length,
    }
    console.log(`SHADOW_RESULTS ${JSON.stringify(results)}`)
    expect(results.markerCount).toBeGreaterThan(0)
    expect(results.attachments).toBeGreaterThan(0)
  } finally {
    await context.close()
    await browser.close()
  }
})

test('records cross-origin, same-origin, cross-origin frame chains', async () => {
  const browser = await launch(false)
  const context = await browser.newContext()
  await context.addInitScript(
    'window.__K6_SESSION_REPLAY_TRACKING_SERVER_URL__ = "http://localhost:0"'
  )
  await context.addInitScript(bundle)
  const page = await context.newPage()
  try {
    await page.goto(`${app}/deep`)
    await expect(
      page
        .frameLocator('#outer')
        .frameLocator('#middle')
        .frameLocator('#great')
        .locator('p')
    ).toHaveText(nestedMarker)
    await page.waitForTimeout(250)
    const events = await drain(page)
    const result = {
      markerCount: JSON.stringify(events).split(nestedMarker).length - 1,
      attachments: events.filter((event) => event.data?.isAttachIframe).length,
    }
    console.log(`DEEP_FRAME_RESULTS ${JSON.stringify(result)}`)
    expect(result.markerCount).toBeGreaterThan(0)
    expect(result.attachments).toBeGreaterThanOrEqual(2)
  } finally {
    await context.close()
    await browser.close()
  }
})

async function popupCase(oldFlag: boolean, injectChild: boolean) {
  const browser = await launch(oldFlag)
  const context = await browser.newContext()
  const page = await context.newPage()
  try {
    await page.goto(app)
    const opened = page.waitForEvent('popup')
    await page.locator('#open').click()
    const popup = await opened
    await popup.waitForLoadState('load')
    await injectTop(popup)
    const childText = await popup
      .frameLocator('#child')
      .locator('p')
      .textContent()
    await popup.waitForTimeout(250)
    if (injectChild) {
      const child = popup
        .frames()
        .find((frame) => frame.url() === `${api}/child`)
      if (!child) throw new Error('Missing popup child frame')
      await child.evaluate((source) => {
        const replayWindow = window as unknown as {
          __K6_SESSION_REPLAY_TRACKING_SERVER_URL__: string
        }
        replayWindow.__K6_SESSION_REPLAY_TRACKING_SERVER_URL__ =
          'http://localhost:0'
        ;(0, eval)(source)
      }, bundle)
      await popup.waitForTimeout(100)
    }
    const events = await drain(popup)
    return {
      markerCount: JSON.stringify(events).split(marker).length - 1,
      attachments: events.filter((event) => event.data?.isAttachIframe).length,
      events: events.length,
      topCaptured: JSON.stringify(events).includes('Parent'),
      childLoaded: childText === marker,
    }
  } finally {
    await context.close()
    await browser.close()
  }
}

test('popup top-only fallback misses child, with old-flag and child-injection controls', async () => {
  const results = {
    secureTopOnly: await popupCase(false, false),
    oldTopOnly: await popupCase(true, false),
    secureWithChild: await popupCase(false, true),
  }
  console.log(`POPUP_COMPONENT_RESULTS ${JSON.stringify(results)}`)
  expect(results.secureTopOnly.topCaptured).toBe(true)
  expect(results.secureTopOnly.childLoaded).toBe(true)
  expect(results.secureTopOnly.markerCount).toBe(0)
  expect(results.oldTopOnly.markerCount).toBeGreaterThan(0)
  expect(results.secureWithChild.markerCount).toBeGreaterThan(0)
})

test('bundled k6 production shim records popup children', async () => {
  test.setTimeout(35_000)
  const run = async (bundleOutput: string, oldFlag: boolean) => {
    replayBodies.length = 0
    const result = await promisify(execFile)(
      'resources/mac/arm64/k6',
      ['run', join(bundleOutput, 'instrumented.js')],
      {
        timeout: 6_000,
        env: {
          ...process.env,
          MOCK_URL: app,
          MOCK_API_URL: api,
          K6_TRACKING_SERVER_PORT: app.split(':').at(-1),
          K6_BROWSER_EXECUTABLE_PATH:
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          K6_BROWSER_HEADLESS: 'true',
          K6_BROWSER_ARGS: [
            'disable-features=site-per-process',
            'disable-site-isolation-trials',
            ...(oldFlag ? ['disable-web-security'] : []),
          ].join(','),
        },
      }
    )
      .then((value) => ({ ...value, timedOut: false }))
      .catch(
        (
          error: Error & { killed?: boolean; stdout?: string; stderr?: string }
        ) => {
          if (!error.killed || !error.stderr?.includes('K6_AFTER_CLOSE')) {
            throw error
          }

          return {
            stdout: error.stdout ?? '',
            stderr: error.stderr,
            timedOut: true,
          }
        }
      )
    const match = `${result.stdout}\n${result.stderr}`.match(
      /K6_POPUP_RESULT (true|false),(true|false),(true|false),(true|false),(true|false)/
    )
    if (!match) throw new Error(`Missing k6 popup result: ${result.stderr}`)
    const replay = replayBodies.join('')
    return {
      topInjected: match[1] === 'true',
      childInjected: match[2] === 'true',
      childLoaded: match[3] === 'true',
      lateLoaded: match[4] === 'true',
      navigatedLoaded: match[5] === 'true',
      markerCount: replay.split(marker).length - 1,
      lateCount: replay.split(lateMarker).length - 1,
      navigatedCount: replay.split(navigatedMarker).length - 1,
      topCaptured: replay.includes('Parent'),
      batches: replayBodies.length,
      timedOut: result.timedOut,
    }
  }

  const results = {
    secure: await run(output, false),
    oldFlag: await run(output, true),
    headSecure: await run(headOutput, false),
  }
  console.log(`K6_POPUP_RESULTS ${JSON.stringify(results)}`)
  expect(results.secure.topInjected).toBe(true)
  expect(results.secure.childInjected).toBe(true)
  expect(results.secure.topCaptured).toBe(true)
  expect(results.secure.childLoaded).toBe(true)
  expect(results.secure.lateLoaded).toBe(true)
  expect(results.secure.navigatedLoaded).toBe(true)
  expect(results.secure.markerCount).toBeGreaterThan(0)
  expect(results.secure.lateCount).toBeGreaterThan(0)
  expect(results.secure.navigatedCount).toBeGreaterThan(0)
  expect(results.oldFlag.markerCount).toBeGreaterThan(0)
  expect(results.headSecure.markerCount).toBe(0)
})
