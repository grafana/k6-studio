import { ipcRenderer } from 'electron'

import { K6Log, K6Check } from '@/types'

import { createListener } from '../utils'

export function showScriptSelectDialog() {
  return ipcRenderer.invoke('script:select') as Promise<string | void>
}

export function openScript(scriptPath: string, absolute: boolean = false) {
  return ipcRenderer.invoke(
    'script:open',
    scriptPath,
    absolute
  ) as Promise<string>
}

export function runScriptFromGenerator(script: string) {
  return ipcRenderer.invoke(
    'script:run-from-generator',
    script
  ) as Promise<void>
}

export function saveScript(script: string, fileName: string) {
  return ipcRenderer.invoke('script:save', script, fileName) as Promise<void>
}

export function runScript(scriptPath: string, absolute: boolean = false) {
  return ipcRenderer.invoke('script:run', scriptPath, absolute) as Promise<void>
}

export function stopScript() {
  ipcRenderer.send('script:stop')
}

export function onScriptLog(callback: (data: K6Log) => void) {
  return createListener('script:log', callback)
}

export function onScriptStopped(callback: () => void) {
  return createListener('script:stopped', callback)
}

export function onScriptFinished(callback: () => void) {
  return createListener('script:finished', callback)
}

export function onScriptFailed(callback: () => void) {
  return createListener('script:failed', callback)
}

export function onScriptCheck(callback: (data: K6Check[]) => void) {
  return createListener('script:check', callback)
}
