import {
  test as base,
  expect,
  chromium,
  type Browser,
  type Page,
} from '@playwright/test'
import { type ChildProcess, spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const EXECUTABLE_NAME = 'k6-studio'
// Distinct from the recorder's CDP port (9222) and the dev server's (9223).
const DEBUG_PORT = 9789

// `electron-forge package` writes to `out/<productName>-<platform>-<arch>/`.
// Resolve the executable for the current platform so tests run unchanged on
// every runner in the matrix.
function resolvePackagedExecutable() {
  const outDir = path.resolve(__dirname, '..', 'out')

  if (!fs.existsSync(outDir)) {
    throw new Error(
      `Packaged output not found at ${outDir}. Run "pnpm package" first.`
    )
  }

  const suffix = `-${process.platform}-${process.arch}`
  const packageDir = fs
    .readdirSync(outDir)
    .find((entry) => entry.endsWith(suffix))

  if (!packageDir) {
    throw new Error(`No packaged app for ${suffix} in ${outDir}`)
  }

  const baseDir = path.join(outDir, packageDir)

  if (process.platform === 'darwin') {
    const appBundle = fs
      .readdirSync(baseDir)
      .find((entry) => entry.endsWith('.app'))

    if (!appBundle) {
      throw new Error(`No .app bundle in ${baseDir}`)
    }

    return path.join(baseDir, appBundle, 'Contents', 'MacOS', EXECUTABLE_NAME)
  }

  if (process.platform === 'win32') {
    return path.join(baseDir, `${EXECUTABLE_NAME}.exe`)
  }

  return path.join(baseDir, EXECUTABLE_NAME)
}

async function waitForDebugEndpoint(timeoutMs: number) {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    try {
      const response = await fetch(
        `http://127.0.0.1:${DEBUG_PORT}/json/version`
      )
      if (response.ok) {
        return
      }
    } catch {
      // endpoint not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  throw new Error(`CDP endpoint never came up on port ${DEBUG_PORT}`)
}

// Launches the packaged app and exposes its renderer window as a Page.
//
// The production fuses disable the Node inspector, so Playwright's
// `_electron.launch` (which attaches to it) cannot drive the packaged app.
// Instead launch the real artifact with Chromium's remote debugging port -- a
// switch fuses do not affect -- and connect over CDP. An isolated user-data dir
// gives the app its own single-instance lock and a clean profile, otherwise the
// lock collides with a running k6 Studio (e.g. a dev `pnpm start`) and the
// second instance immediately quits.
export const test = base.extend<{ appWindow: Page }>({
  appWindow: async ({}, use) => {
    const executablePath = resolvePackagedExecutable()
    const userDataDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'k6-studio-smoke-')
    )

    let app: ChildProcess | undefined
    let browser: Browser | undefined

    try {
      app = spawn(
        executablePath,
        [
          `--remote-debugging-port=${DEBUG_PORT}`,
          `--user-data-dir=${userDataDir}`,
        ],
        { stdio: 'ignore' }
      )

      await waitForDebugEndpoint(30_000)

      browser = await chromium.connectOverCDP(`http://127.0.0.1:${DEBUG_PORT}`)
      const context = browser.contexts()[0]
      if (!context) {
        throw new Error('No browser context exposed over CDP')
      }
      const window =
        context.pages().find((page) => !page.url().startsWith('devtools://')) ??
        (await context.waitForEvent('page'))

      await use(window)
    } finally {
      await browser?.close()
      app?.kill('SIGKILL')
    }
  },
})

export { expect }
