import { dialog, BrowserWindow } from 'electron'
import log from 'electron-log/main'
import { ChildProcessWithoutNullStreams } from 'node:child_process'
import { createReadStream, createWriteStream } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'path'
import * as tar from 'tar-stream'
import { z } from 'zod'

import { TEMP_K6_ARCHIVE_PATH, TEMP_SCRIPT_SUFFIX } from '@/constants/workspace'
import { ScriptHandler } from '@/handlers/script/types'
import { getProxyArguments } from '@/main/proxy'
import { ProxySettings } from '@/types/settings'
import { ArchiveError, K6Client } from '@/utils/k6/client'
import { createTrackingServer } from '@/utils/k6/tracking'
import { readResource } from '@/utils/resources'

import {
  instrumentScriptFromPath as instrumentScriptFromPath,
  replaceModules,
} from './runner/instrumentation'

export type K6Process = ChildProcessWithoutNullStreams

const K6_TESTING_LIB_REGEX =
  /^https\/jslib\.k6\.io\/k6-testing\/\d+\.\d+\.\d+\/index\.js$/i

const K6_TESTING_UNSUPPORTED_VERSIONS = new Set(
  ['0.1.0', '0.2.0', '0.3.0', '0.4.0', '0.5.0', '0.6.0', '0.6.1'].map(
    (version) => `https/jslib.k6.io/k6-testing/${version}/index.js`
  )
)

function isSupportedTestingLibrary(path: string) {
  if (path === K6_TESTING_OVERRIDE.replace('://', '/')) {
    return true
  }

  return (
    K6_TESTING_LIB_REGEX.test(path) &&
    !K6_TESTING_UNSUPPORTED_VERSIONS.has(path)
  )
}

const ArchiveManifestSchema = z.looseObject({
  filename: z.string(),
  options: z.looseObject({
    scenarios: z
      .record(
        z.string(),
        z.looseObject({
          options: z
            .looseObject({
              browser: z.unknown().nullish(),
            })
            .nullish(),
        })
      )
      .nullish(),
  }),
})

export const showScriptSelectDialog = async (browserWindow: BrowserWindow) => {
  const result = await dialog.showOpenDialog(browserWindow, {
    properties: ['openFile'],
    filters: [{ name: 'k6 test script', extensions: ['js'] }],
  })

  if (result.canceled) return

  const [scriptPath] = result.filePaths
  return scriptPath
}

export const getTempScriptName = () => {
  return `.${Math.random().toString(36).substring(7)}${TEMP_SCRIPT_SUFFIX}`
}

interface RunScriptOptions {
  scriptPath: string
  usageReport: boolean
  proxySettings: ProxySettings
  browserWindow: BrowserWindow
}

export const runScript = async ({
  scriptPath,
  usageReport,
  proxySettings,
  browserWindow,
}: RunScriptOptions) => {
  const archivePath = await archiveScript(scriptPath, browserWindow)
  const modifiedPath = await installEntrypoint(archivePath)

  // // 1. Get an instrumented version of the script content
  // const modifiedScript = await instrumentScriptFromPath(scriptPath)

  // // 2. Save the enhanced script content to a temp file in the same directory as the original script
  // // (k6 will look for modules/data files in the same directory as the script)
  // const dirname = path.dirname(scriptPath)

  // const tempFileName = getTempScriptName()
  // const tempScriptPath = path.join(dirname, tempFileName)

  // await writeFile(tempScriptPath, modifiedScript)

  // // 3. Archive the script and its dependencies
  // // const archivePath = await archiveScript(tempScriptPath, browserWindow)

  // // 4. Delete the temp script file
  // await unlink(tempScriptPath)

  const proxyArgs = await getProxyArguments(proxySettings, {
    prefix: '',
  })

  const trackingServer = await createTrackingServer()

  trackingServer.on('begin', (ev) => {
    browserWindow.webContents.send(ScriptHandler.BrowserAction, ev)
  })

  trackingServer.on('end', (ev) => {
    browserWindow.webContents.send(ScriptHandler.BrowserAction, ev)
  })

  trackingServer.on('log', (ev) => {
    browserWindow.webContents.send(ScriptHandler.Log, ev.entry)
  })

  trackingServer.on('replay', (ev) => {
    browserWindow.webContents.send(ScriptHandler.BrowserReplay, ev.events)
  })

  // 5. Run the test
  const client = new K6Client()

  const testRun = client.run({
    path: modifiedPath,
    quiet: true,
    insecureSkipTLSVerify: true,
    noUsageReport: !usageReport,
    env: {
      HTTP_PROXY: `http://localhost:${proxySettings.port}`,
      HTTPS_PROXY: `http://localhost:${proxySettings.port}`,
      NO_PROXY: 'jslib.k6.io',
      K6_TRACKING_SERVER_PORT: String(trackingServer?.port),
      K6_BROWSER_ARGS: proxyArgs.join(','),
      K6_TESTING_COLORIZE: 'false',
    },
  })

  testRun.on('log', ({ entry }) => {
    browserWindow.webContents.send(ScriptHandler.Log, entry)
  })

  testRun.on('start', () => {
    browserWindow.webContents.send(ScriptHandler.Started, {})
  })

  testRun.on('done', ({ result, checks }) => {
    browserWindow.webContents.send(ScriptHandler.Check, checks)
    browserWindow.webContents.send(ScriptHandler.Finished, result)
  })

  testRun.on('error', (error) => {
    log.error(error)

    browserWindow.webContents.send(ScriptHandler.Failed)
  })

  testRun.on('stop', () => {
    browserWindow.webContents.send(ScriptHandler.Stopped)

    trackingServer?.dispose()
  })

  return testRun
}

const archiveScript = async (
  scriptPath: string,
  browserWindow: BrowserWindow
): Promise<string> => {
  try {
    const client = new K6Client()

    // Set cwd to script directory for import resolution on Windows
    const scriptDir = path.dirname(scriptPath)

    await client.archive({
      scriptPath,
      outputPath: TEMP_K6_ARCHIVE_PATH,
      cwd: scriptDir,
    })

    return TEMP_K6_ARCHIVE_PATH
  } catch (error) {
    browserWindow.webContents.send(ScriptHandler.Failed)

    if (error instanceof ArchiveError) {
      for (const log of error.stderr) {
        browserWindow.webContents.send(ScriptHandler.Log, log)
      }
    }

    throw error
  }
}

function installEntrypoint(archivePath: string): Promise<string> {
  const resolvers = Promise.withResolvers<string>()
  const abortController = new AbortController()

  const targetPath = path.join(
    path.dirname(archivePath),
    'modified-' + path.basename(archivePath)
  )

  const readStream = createReadStream(archivePath, {
    signal: abortController.signal,
  })

  const writeStream = createWriteStream(targetPath, {
    signal: abortController.signal,
  })

  const extract = tar.extract()
  const pack = tar.pack()

  let metadata: z.infer<typeof ArchiveManifestSchema> | null = null
  let scriptContent: string | null = null

  const testingLibs: Array<{ path: string; url: string }> = []

  extract.on('entry', (header, stream, next) => {
    if (header.name === 'data') {
      const chunks: Buffer[] = []

      stream.on('data', (chunk: ArrayBufferLike) => {
        chunks.push(Buffer.from(chunk))
      })

      stream.on('end', () => {
        scriptContent = Buffer.concat(chunks).toString('utf-8')

        next()
      })

      return
    }

    if (header.name === 'metadata.json') {
      const chunks: Buffer[] = []

      stream.on('data', (chunk: ArrayBufferLike) => {
        chunks.push(Buffer.from(chunk))
      })

      stream.on('end', () => {
        const content = Buffer.concat(chunks).toString('utf-8')

        metadata = tryParseMetadata(content)

        next()
      })

      return
    }

    if (isSupportedTestingLibrary(header.name)) {
      const modifiedPath = path.join(
        path.dirname(header.name),
        'index.original.js'
      )

      const [protocol, ...rest] = modifiedPath.split('/')
      const url = `${protocol}://${rest.join('/')}`

      testingLibs.push({
        path: header.name,
        url,
      })

      header.name = modifiedPath

      stream.pipe(pack.entry(header, next))

      return
    }

    stream.pipe(pack.entry(header, next))
  })

  extract.on('finish', async () => {
    if (metadata === null) {
      abortController.abort()

      resolvers.reject(new Error('Metadata not found in archive'))

      return
    }

    const scriptPath = fileURLToPath(metadata.filename)
    const entrypointPath = path.join(
      path.dirname(scriptPath),
      getTempScriptName()
    )

    const modifiedMetadata = {
      ...metadata,
      filename: pathToFileURL(entrypointPath).toString(),
      options: {
        ...metadata.options,
        vus: null,
        iterations: null,
        stages: null,
        scenarios: {
          default: {
            executor: 'shared-iterations',
            vus: 1,
            iterations: 1,
            options: metadata.options.scenarios?.default?.options,
          },
        },
      },
    }

    pack.entry(
      { name: 'metadata.json' },
      JSON.stringify(modifiedMetadata, null, 2)
    )

    const entrypointScript = await instrumentScriptFromPath(
      './' + path.basename(scriptPath)
    )

    pack.entry({ name: 'data' }, entrypointScript)
    pack.entry(
      {
        name: path.join('file', entrypointPath),
        linkname: 'data',
      },
      ''
    )

    pack.entry({ name: path.join('file', scriptPath) }, scriptContent ?? '')

    if (testingLibs.length > 0) {
      const shim = await readResource('k6-testing-shim')

      for (const lib of testingLibs) {
        const newModule = replaceModules(shim, {
          __K6_TESTING_EXPECT_PATH__: lib.url,
        })

        pack.entry({ name: lib.path }, newModule)
      }
    }

    pack.finalize()
  })

  writeStream.on('close', () => {
    resolvers.resolve(targetPath)
  })

  readStream.pipe(extract)
  pack.pipe(writeStream)

  return resolvers.promise
}

function tryParseMetadata(
  content: string
): z.infer<typeof ArchiveManifestSchema> | null {
  try {
    return ArchiveManifestSchema.parse(JSON.parse(content))
  } catch {
    return null
  }
}
