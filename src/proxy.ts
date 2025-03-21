import { app, BrowserWindow } from 'electron'
import log from 'electron-log/main'
import { readFile } from 'fs/promises'
import forge from 'node-forge'
import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process'
import path from 'path'
import readline from 'readline/promises'

import { ProxyData } from './types'
import { ProxySettings } from './types/settings'
import { getPlatform, getArch } from './utils/electron'
import { safeJsonParse } from './utils/json'

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
  ]

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

    const proxyData = safeJsonParse<ProxyData>(data)
    if (proxyData) {
      browserWindow.webContents.send('proxy:data', proxyData)
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

    browserWindow.webContents.send('proxy:close', code)
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

export const getCertificateSPKI = async () => {
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
