import log from 'electron-log/main'
import { HttpsProxyAgent } from 'https-proxy-agent'
import https from 'node:https'

import { getProxyCertificateContent, getProxyURL } from './proxy'

export const checkProxyHealth = async () => {
  try {
    const results = await Promise.allSettled([
      isUrlReachable('https://www.google.com/generate_204'),
      isUrlReachable('https://quickpizza.grafana.com'),
    ])
    const isProxyHealthy = results.some(
      (r) => r.status === 'fulfilled' && r.value === true
    )
    return isProxyHealthy
  } catch (error) {
    log.error('Error checking proxy health:', error)
    return false
  }
}

const isUrlReachable = (url: string) => {
  return new Promise((resolve) => {
    const certContent = getProxyCertificateContent()
    const agent = new HttpsProxyAgent(getProxyURL())
    const options: https.RequestOptions = {
      agent,
      ca: certContent,
      headers: {
        'X-K6-Studio-Health-Check': 'true',
      },
      rejectUnauthorized: !k6StudioState.appSettings.proxy.sslInsecure,
    }

    https
      .get(url, options, (res) => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
          return resolve(true)
        }
        resolve(false)
      })
      .on('error', (err) => {
        log.error(err)
        resolve(false)
      })
  })
}
