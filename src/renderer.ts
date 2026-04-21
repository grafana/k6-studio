import './index.tsx'
import { setMonacoEnv } from './components/Monaco/setMonacoEnv'
import * as Sentry from './sentry'
import { ProxyData } from './types'

setMonacoEnv()

Sentry.configureRendererProcess()

// `window.studio` is ensured in index.tsx before React mounts (browser fallback).
window.studio.proxy.onProxyData((_data: ProxyData) => {})
