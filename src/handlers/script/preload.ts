import { ipcRenderer } from 'electron'

import { K6Log, K6Check } from '@/types'

import { createListener } from '../utils'

import { ScriptHandler } from './types'

export function showScriptSelectDialog() {
  return ipcRenderer.invoke(ScriptHandler.Select) as Promise<string | void>
}

export function openScript(scriptPath: string, absolute: boolean = false) {
  return ipcRenderer.invoke(
    ScriptHandler.Open,
    scriptPath,
    absolute
  ) as Promise<string>
}

export function runScriptFromGenerator(script: string) {
  return ipcRenderer.invoke(
    ScriptHandler.RunFromGenerator,
    script
  ) as Promise<void>
}

export function saveScript(script: string, fileName: string) {
  return ipcRenderer.invoke(
    ScriptHandler.Save,
    script,
    fileName
  ) as Promise<void>
}

export function runScript(scriptPath: string, absolute: boolean = false) {
  return ipcRenderer.invoke(
    ScriptHandler.Run,
    scriptPath,
    absolute
  ) as Promise<void>
}

export function stopScript() {
  ipcRenderer.send(ScriptHandler.Stop)
}

export function onScriptLog(callback: (data: K6Log) => void) {
  return createListener(ScriptHandler.Log, callback)
}

export function onScriptStopped(callback: () => void) {
  return createListener(ScriptHandler.Stopped, callback)
}

export function onScriptFinished(callback: () => void) {
  return createListener(ScriptHandler.Finished, callback)
}

export function onScriptFailed(callback: () => void) {
  return createListener(ScriptHandler.Failed, callback)
}

export function onScriptCheck(callback: (data: K6Check[]) => void) {
  return createListener(ScriptHandler.Check, callback)
}
