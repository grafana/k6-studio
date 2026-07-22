import {
  test as base,
  expect,
  chromium,
  type Browser,
  type BrowserContext,
  type Page,
} from '@playwright/test'
import { type ChildProcess, spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const EXECUTABLE_NAME = 'k6-studio'

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

// Electron writes the actual remote-debugging port to DevToolsActivePort in the
// user-data dir once the CDP server is listening. Reading it (rather than a
// fixed port) ties the connection to the instance we spawned and avoids
// colliding with any other Electron on the machine.
function readDebugPort(userDataDir: string) {
  const portFile = path.join(userDataDir, 'DevToolsActivePort')
  if (!fs.existsSync(portFile)) {
    return undefined
  }
  const port = Number(fs.readFileSync(portFile, 'utf8').split('\n')[0])
  return Number.isInteger(port) && port > 0 ? port : undefined
}

interface DebugPortProbes {
  getStderr: () => string
  getExit: () => string | undefined
  getError: () => Error | undefined
}

async function waitForDebugPort(
  userDataDir: string,
  timeoutMs: number,
  probes: DebugPortProbes
) {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    const error = probes.getError()
    if (error) {
      throw new Error(`App failed to launch: ${error.message}`)
    }
    const exit = probes.getExit()
    if (exit) {
      throw new Error(
        `App exited before exposing CDP (${exit}). App stderr:\n${probes.getStderr()}`
      )
    }
    const port = readDebugPort(userDataDir)
    if (port !== undefined) {
      return port
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error(`CDP port never came up. App stderr:\n${probes.getStderr()}`)
}

// DevToolsActivePort is written when Chromium's CDP server binds, which happens
// before the main process creates the window and loads the renderer. So at
// connect time context.pages() may not yet list the Home window -- poll until it
// appears rather than throwing immediately.
async function waitForRendererPage(context: BrowserContext, timeoutMs: number) {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    const page = context
      .pages()
      .find((candidate) => !candidate.url().startsWith('devtools://'))
    if (page) {
      return page
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error('No renderer page exposed over CDP within timeout')
}

// Launches the packaged app and exposes its renderer window as a Page.
//
// The production fuses disable the Node inspector, so Playwright's
// `_electron.launch` (which attaches to it) cannot drive the packaged app.
// Instead launch the real artifact with Chromium's remote debugging port -- a
// switch fuses do not affect -- and connect over CDP. An isolated user-data dir
// is required for two reasons: it gives the app its own single-instance lock so
// it does not collide with a running k6 Studio (e.g. a dev `pnpm start`, which
// would make the second instance immediately quit), and it gives a known path
// to read the chosen port from (<userDataDir>/DevToolsActivePort).
export const test = base.extend<{ appWindow: Page }>({
  appWindow: async ({}, use) => {
    const executablePath = resolvePackagedExecutable()
    const userDataDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'k6-studio-smoke-')
    )

    let app: ChildProcess | undefined
    let browser: Browser | undefined

    // Port 0 lets Electron pick a free port, reported via DevToolsActivePort.
    const args = ['--remote-debugging-port=0', `--user-data-dir=${userDataDir}`]
    // Ubuntu CI runners restrict unprivileged user namespaces (AppArmor), so
    // Electron's Chromium sandbox fails to start and the app never exposes the
    // debugging port. The smoke test only launches a throwaway packaged build,
    // so disabling the sandbox on Linux is safe.
    if (process.platform === 'linux') {
      args.push('--no-sandbox')
    }

    try {
      app = spawn(executablePath, args, {
        stdio: ['ignore', 'ignore', 'pipe'],
      })

      let stderr = ''
      app.stderr?.on('data', (chunk: Buffer) => {
        stderr += chunk.toString()
      })
      // Capturing 'error' both surfaces spawn failures (missing/non-executable
      // binary) and stops the unhandled event from crashing the test worker.
      let spawnError: Error | undefined
      app.on('error', (error) => {
        spawnError = error
      })
      let exitInfo: string | undefined
      app.on('exit', (code, signal) => {
        exitInfo = `code=${code} signal=${signal ?? 'none'}`
      })

      const port = await waitForDebugPort(userDataDir, 30_000, {
        getStderr: () => stderr,
        getExit: () => exitInfo,
        getError: () => spawnError,
      })

      browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`)
      const context = browser.contexts()[0]
      if (!context) {
        throw new Error('No browser context exposed over CDP')
      }
      const window = await waitForRendererPage(context, 20_000)

      await use(window)
    } finally {
      // Kill the app even if browser.close() rejects (e.g. the packaged app
      // already exited), then remove the throwaway profile.
      try {
        await browser?.close()
      } finally {
        app?.kill('SIGKILL')
      }
      // The profile dir is a throwaway under os.tmpdir() (OS-reaped; CI runners
      // are ephemeral). We deliberately do not rmSync it -- SIGKILL is async and
      // the dying helper processes keep writing to it, which races rmSync into
      // ENOTEMPTY.
    }
  },
})

export { expect }
