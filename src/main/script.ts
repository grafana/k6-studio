import { dialog, BrowserWindow } from 'electron'
import log from 'electron-log/main'
import { ChildProcessWithoutNullStreams } from 'node:child_process'
import { createReadStream, createWriteStream } from 'node:fs'
import { unlink } from 'node:fs/promises'
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

  const targetPath = path.join(
    path.dirname(archivePath),
    'shimmed-' + path.basename(archivePath)
  )

  // We do all of the modifications to the archive in a single pass to avoid having to read
  // potentially large files multiple times.
  const readStream = createReadStream(archivePath)
  const writeStream = createWriteStream(targetPath)

  const extract = tar.extract()
  const pack = tar.pack()

  let metadata: z.infer<typeof ArchiveManifestSchema> | null = null
  let scriptContent: string | null = null
  let settled = false

  const testingLibs: Array<{ path: string; url: string }> = []

  const fail = (error: unknown) => {
    if (settled) {
      return
    }

    settled = true

    log.error('Failed to install entrypoint', error)

    readStream.destroy()
    writeStream.destroy()
    extract.destroy()
    pack.destroy()

    // Best-effort cleanup of any partial output file.
    unlink(targetPath).catch(() => {})

    resolvers.reject(error instanceof Error ? error : new Error(String(error)))
  }

  readStream.on('error', fail)
  writeStream.on('error', fail)
  extract.on('error', fail)
  pack.on('error', fail)

  // A k6 archive is a tarball with the following structure:
  //
  // - metadata.json: contains the original entry script path and the options used to run the script
  // - data: contains the content of the entry script (the path to this file is stored in metadata.json)
  // - file/: contains all modules and data files imported by the script, incl. the entry script (symlinked to data)
  // - https/: contains any remote modules imported by the script.
  //
  // We never want to modify any of the user's original files, (incl. their filenames, since this would
  // alter stack traces) so we avoid modifying anything inside file/.
  extract.on('entry', (header, stream, next) => {
    // The 'data' entry is where the content of the entry script is stored and the code that actually
    // runs when you start a test. The path given by `metadata.filename` is just a symlink to this file.
    //
    // In order to install our entrypoint, we need to modify the content of the 'data' entry but doing
    // so would overwrite the original script content. To work around this, we store the original script
    // content in memory until we have the metadata and can write the content at its original path in the
    // modified archive.
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

    // Read and parse the metadata so that we can modify the entrypoint.
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

    // We don't want to release a new version of k6 Studio every time there's a new version of k6-testing,
    // so we detect imports of k6-testing based on a pattern and install a shim for each version we encounter.
    if (isSupportedTestingLibrary(header.name)) {
      // We will be installing our shim at the path of the original module, and then import this renamed file in the shim.
      const modifiedPath = path.join(
        path.dirname(header.name),
        'index.original.js'
      )

      // Paths for remote modules look pretty much like URLs but with the protocol separator replaced by a slash,
      // e.g. https/jslib.k6.io/k6-testing/0.1.0/index.js. We can reconstruct the original URL by reading the
      // first segment as the protocol.
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

    // Any other entry we just add back to the archive without modification
    stream.pipe(pack.entry(header, next))
  })

  extract.on('finish', async () => {
    try {
      if (metadata === null) {
        throw new Error('Metadata not found in archive')
      }

      if (scriptContent === null) {
        throw new Error('Script content not found in archive')
      }

      // `open` and `fs.open` read files relative to the entry script, so we need to make sure that
      // our entry script is placed in the same directory as the original one so that paths are resolved correctly.
      const scriptPath = fileURLToPath(metadata.filename)
      const entrypointPath = path.join(
        path.dirname(scriptPath),
        getTempScriptName()
      )

      const modifiedMetadata = {
        ...metadata,
        // Change the entrypoint to point to our instrumented script instead of the original one.
        filename: pathToFileURL(entrypointPath).toString(),
        options: {
          ...metadata.options,
          vus: null,
          iterations: null,
          stages: null,
          // Even though the user's script might have multiple scenarios, our entrypoint only has one
          // and it should always run 1 iteration with 1 VU.
          scenarios: {
            default: {
              executor: 'shared-iterations',
              vus: 1,
              iterations: 1,
              // We do, however, need to remember whether the user is using k6/browser or not
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

      // Write our entrypoint and setup a symlink.
      pack.entry({ name: 'data' }, entrypointScript)
      pack.entry(
        {
          name: path.join('file', entrypointPath),
          linkname: 'data',
        },
        ''
      )

      // Write the original script content at the original entry path
      pack.entry({ name: path.join('file', scriptPath) }, scriptContent)

      if (testingLibs.length > 0) {
        const shim = await readResource('k6-testing-shim')

        // Install a shim for each imported k6-testing version.
        for (const lib of testingLibs) {
          // Make sure the shim imports the original module that we renamed earlier.
          const newModule = replaceModules(shim, {
            __K6_TESTING_EXPECT_PATH__: lib.url,
          })

          pack.entry({ name: lib.path }, newModule)
        }
      }

      pack.finalize()
    } catch (error) {
      fail(error)
    }
  })

  writeStream.on('close', () => {
    if (settled) return
    settled = true
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
