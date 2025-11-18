import { ipcRenderer } from 'electron'

import { Check, LogEntry } from '@/schemas/k6'

import { createListener } from '../utils'

import { OpenScriptResult, ScriptHandler } from './types'

export function showScriptSelectDialog() {
  return ipcRenderer.invoke(ScriptHandler.Select) as Promise<string | void>
}

export function openScript(scriptPath: string) {
  return ipcRenderer.invoke(
    ScriptHandler.Open,
    scriptPath
  ) as Promise<OpenScriptResult>
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

export function runScript(scriptPath: string) {
  return ipcRenderer.invoke(ScriptHandler.Run, scriptPath) as Promise<void>
}

export function stopScript() {
  ipcRenderer.send(ScriptHandler.Stop)
}

export function onScriptLog(callback: (data: LogEntry) => void) {
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

export function onScriptCheck(callback: (data: Check[]) => void) {
  return createListener(ScriptHandler.Check, callback)
}
