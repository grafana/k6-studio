import { app, BrowserWindow } from 'electron'
import log from 'electron-log/main'
import find from 'find-process'
import { readFile } from 'fs/promises'
import forge from 'node-forge'
import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'path'
import readline from 'readline/promises'
import kill from 'tree-kill'

import { ProxyHandler } from '../handlers/proxy/types'
import { ProxyData } from '../types'
import { ProxySettings } from '../types/settings'
import {
  getPlatform,
  getArch,
  findOpenPort,
  sendToast,
} from '../utils/electron'
import { safeJsonParse } from '../utils/json'

import { expandHomeDir } from './file'
export type ProxyProcess = ChildProcessWithoutNullStreams

interface options {
  onReady?: () => void
  onFailure?: () => void
}

export const launchProxy = (
  browserWindow: BrowserWindow,
  proxySettings: ProxySettings,
  { onReady, onFailure }: options = {}
): ProxyProcess => {
  let proxyScript: string
  let proxyPath: string
  const certificatesPath = getCertificatesPath()

  // if we are in dev server we take resources directly, otherwise look in the app resources folder.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    proxyScript = path.join(app.getAppPath(), 'resources', 'json_output.py')
    proxyPath = path.join(
      app.getAppPath(),
      'resources',
      getPlatform(),
      getArch(),
      'k6-studio-proxy'
    )
  } else {
    proxyScript = path.join(process.resourcesPath, 'json_output.py')
    // only the architecture directory will be in resources on the packaged app
    proxyPath = path.join(process.resourcesPath, getArch(), 'k6-studio-proxy')
  }

  // add .exe on windows
  proxyPath += getPlatform() === 'win' ? '.exe' : ''

  const proxyArgs = [
    '-q',
    '-s',
    proxyScript,
    '--set',
    `confdir=${certificatesPath}`,
    '--listen-port',
    `${proxySettings.port}`,
    '--mode',
    getProxyMode(proxySettings),
    '--set',
    'validate_inbound_headers=false',
  ]

  if (proxySettings.sslInsecure) {
    proxyArgs.push('--ssl-insecure')
  }

  if (proxySettings.mode === 'upstream' && proxySettings.requiresAuth) {
    const { username, password } = proxySettings
    proxyArgs.push('--upstream-auth', `${username}:${password}`)
  }

  if (proxySettings.mode === 'upstream' && proxySettings.certificatePath) {
    proxyArgs.push(
      '--set',
      `ssl_verify_upstream_trusted_ca=${proxySettings.certificatePath}`
    )
  }

  const proxy = spawn(proxyPath, proxyArgs)

  // we use a reader to read entire lines from stdout instead of buffered data
  const stdoutReader = readline.createInterface(proxy.stdout)

  stdoutReader.on('line', (data) => {
    // console.log(`stdout: ${data}`)

    if (data === 'Proxy Started~') {
      console.log(data)
      onReady?.()
      return
    }

    // TODO: add zod schema validation
    const proxyData = safeJsonParse<ProxyData>(data)
    if (proxyData) {
      browserWindow.webContents.send(ProxyHandler.Data, proxyData)
    } else {
      // the proxy outputs some errors to stdout
      // example: [Errno 48] HTTP(S) proxy failed to listen on *:6001
      log.error(data)
    }
  })

  proxy.stderr.on('data', (data: Buffer) => {
    console.error(`stderr: ${data.toString()}`)
    log.error(data.toString())
  })

  proxy.on('close', (code) => {
    console.log(`proxy process exited with code ${code}`)

    // if the window is destroyed we don't have to do anything else since we are quitting
    if (browserWindow.isDestroyed()) {
      return
    }

    browserWindow.webContents.send(ProxyHandler.Close, code)
    onFailure?.()
  })

  return proxy
}

const getProxyMode = (proxySettings: ProxySettings) => {
  if (proxySettings.mode === 'upstream') {
    return `upstream:${proxySettings.url}`
  }

  return 'regular'
}

export const getCertificatesPath = () => {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    return path.join(app.getAppPath(), 'resources', 'certificates')
  } else {
    return path.join(app.getPath('userData'), 'certificates')
  }
}

const getCertificateSPKI = async () => {
  const certificatePath = path.join(
    getCertificatesPath(),
    'mitmproxy-ca-cert.pem'
  )
  const certificatePem = await readFile(certificatePath, { encoding: 'utf-8' })

  const certificate = forge.pki.certificateFromPem(certificatePem)
  const spki = forge.pki.getPublicKeyFingerprint(certificate.publicKey, {
    type: 'SubjectPublicKeyInfo',
    md: forge.md.sha256.create(),
    encoding: 'binary',
  })

  // base64 encoded spki
  return forge.util.encode64(spki)
}

export const waitForProxy = async (): Promise<void> => {
  if (k6StudioState.proxyStatus === 'online') {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    k6StudioState.proxyEmitter.once('ready', () => {
      resolve()
    })
  })
}

export const launchProxyAndAttachEmitter = async (
  browserWindow: BrowserWindow
) => {
  const PROXY_RETRY_LIMIT = 5
  const { port, automaticallyFindPort } = k6StudioState.appSettings.proxy

  const proxyPort = automaticallyFindPort ? await findOpenPort(port) : port
  k6StudioState.appSettings.proxy.port = proxyPort

  console.log(
    `launching proxy ${JSON.stringify(k6StudioState.appSettings.proxy)}`
  )

  k6StudioState.proxyEmitter.emit('status:change', 'starting')

  return launchProxy(browserWindow, k6StudioState.appSettings.proxy, {
    onReady: () => {
      k6StudioState.wasProxyStoppedByClient = false
      k6StudioState.proxyEmitter.emit('status:change', 'online')
      k6StudioState.proxyEmitter.emit('ready')
    },
    onFailure: async () => {
      if (k6StudioState.wasProxyStoppedByClient) {
        k6StudioState.proxyEmitter.emit('status:change', 'offline')
      }

      if (
        k6StudioState.appShuttingDown ||
        k6StudioState.wasProxyStoppedByClient ||
        k6StudioState.proxyStatus === 'starting'
      ) {
        // don't restart the proxy if the app is shutting down, manually stopped by client or already restarting
        return
      }

      if (
        k6StudioState.proxyRetryCount === PROXY_RETRY_LIMIT &&
        !automaticallyFindPort
      ) {
        k6StudioState.proxyRetryCount = 0
        k6StudioState.proxyEmitter.emit('status:change', 'offline')

        sendToast(browserWindow.webContents, {
          title: `Port ${proxyPort} is already in use`,
          description:
            'Please select a different port or enable automatic port selection',
          status: 'error',
        })

        return
      }

      k6StudioState.proxyRetryCount++
      k6StudioState.proxyEmitter.emit('status:change', 'starting')
      k6StudioState.currentProxyProcess =
        await launchProxyAndAttachEmitter(browserWindow)

      const errorMessage = `Proxy failed to start on port ${proxyPort}, restarting...`
      log.error(errorMessage)
      sendToast(browserWindow.webContents, {
        title: errorMessage,
        status: 'error',
      })
    },
  })
}

export const stopProxyProcess = async () => {
  if (k6StudioState.currentProxyProcess) {
    k6StudioState.currentProxyProcess.kill()
    k6StudioState.currentProxyProcess = null

    // kill remaining proxies if any, this might happen on windows
    if (getPlatform() === 'win') {
      await cleanUpProxies()
    }
  }
}

export const cleanUpProxies = async () => {
  const processList = await find('name', 'k6-studio-proxy', false)
  processList.forEach((proc) => {
    kill(proc.pid)
  })
}

export const getProxyURL = () => {
  const { proxy } = k6StudioState.appSettings
  if (proxy.mode === 'upstream') {
    return proxy.url
  }
  return `http://localhost:${proxy.port}`
}

const getProxyCertificatePath = () => {
  const { proxy } = k6StudioState.appSettings
  if (proxy.mode === 'upstream') {
    return proxy.certificatePath
  }
  return path.join(getCertificatesPath(), 'mitmproxy-ca-cert.pem')
}

export const getProxyCertificateContent = () => {
  const certPath = expandHomeDir(getProxyCertificatePath())
  if (certPath && existsSync(certPath)) {
    return readFileSync(certPath)
  }
  return undefined
}

export async function getProxyArguments(
  settings: ProxySettings,
  options: { prefix: string } = { prefix: '--' }
): Promise<string[]> {
  const spki = await getCertificateSPKI()
  const port = settings.port

  return [
    `${options.prefix}proxy-server=http://localhost:${port}`,
    `${options.prefix}ignore-certificate-errors-spki-list=${spki}`,
  ]
}
