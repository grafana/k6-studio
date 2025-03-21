import './index.tsx'
import { setMonacoEnv } from './components/Monaco/setMonacoEnv'
import * as Sentry from './sentry'
import { ProxyData } from './types'

setMonacoEnv()

Sentry.configureRendererProcess()

// Proxy

window.studio.proxy.onProxyData((_data: ProxyData) => {})
