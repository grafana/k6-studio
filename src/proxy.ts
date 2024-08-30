import { app, BrowserWindow } from 'electron'
import path from 'path'
import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process'
import { getPlatform, getArch } from './utils/electron'
import forge from 'node-forge'
import { readFile } from 'fs/promises'
import { ProxyData } from './types'
import readline from 'readline/promises'
import { safeJsonParse } from './utils/json'

export type ProxyProcess = ChildProcessWithoutNullStreams

interface options {
  onReady?: () => void
  onFailure?: () => void
}

export const launchProxy = (
  browserWindow: BrowserWindow,
  port?: number,
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
  ]

  if (port) {
    proxyArgs.push('--mode', `regular@${port}`)
  }

  const proxy = spawn(proxyPath, proxyArgs)

  // we use a reader to read entire lines from stdout instead of buffered data
  const stdoutReader = readline.createInterface(proxy.stdout)

  stdoutReader.on('line', (data) => {
    console.log(`stdout: ${data}`)

    if (data === 'Proxy Started~') {
      onReady?.()
      return
    }

    const proxyData = safeJsonParse<ProxyData>(data)
    if (proxyData) {
      if (proxyData.request?.host === 'grafana.com') {
        browserWindow.webContents.send('proxy:data', proxyData)
      }
    }
  })

  proxy.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`)
  })

  proxy.on('close', (code) => {
    console.log(`proxy process exited with code ${code}`)
    browserWindow.webContents.send('proxy:close', code)
    onFailure?.()
  })

  return proxy
}

export const getCertificatesPath = () => {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    return path.join(app.getAppPath(), 'resources', 'certificates')
  } else {
    return path.join(process.resourcesPath, 'certificates')
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
