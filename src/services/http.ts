import log from 'electron-log/main'
import { readFile } from 'node:fs/promises'
import { getGlobalDispatcher, ProxyAgent, setGlobalDispatcher } from 'undici'

import { UpstreamProxySettings } from '@/schemas/settings'

const DEFAULT_DISPATCHER = getGlobalDispatcher()

async function readCertificate(path: string | undefined) {
  if (path === undefined || path.trim() === '') {
    return undefined
  }

  try {
    return await readFile(path, 'utf-8')
  } catch (error) {
    log.error('Failed to read proxy certificate.', error)

    return undefined
  }
}

function getAuthorizationHeader({ username, password }: UpstreamProxySettings) {
  if (username === undefined || password === undefined) {
    return undefined
  }

  return {
    'Proxy-Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
  }
}

export async function configureSystemProxy() {
  const proxy = k6StudioState.appSettings.proxy

  if (proxy.mode === 'regular') {
    setGlobalDispatcher(DEFAULT_DISPATCHER)

    return
  }

  const certificate = await readCertificate(proxy.certificatePath)

  const agent = new ProxyAgent({
    uri: proxy.url,
    headers: getAuthorizationHeader(proxy),
    requestTls: {
      ca: certificate,
      rejectUnauthorized: !proxy.sslInsecure,
    },
  })

  setGlobalDispatcher(agent)
}
