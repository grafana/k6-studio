import { ipcRenderer } from 'electron'

import { BrowserActionEvent, BrowserReplayEvent } from '@/main/runner/schema'
import { Check, LogEntry } from '@/schemas/k6'
import { K6TestOptions } from '@/utils/k6/schema'

import { createListener } from '../utils'

import {
  RunScriptFromGeneratorOptions,
  RunScriptOptions,
  ScriptHandler,
} from './types'

export function showScriptSelectDialog() {
  return ipcRenderer.invoke(ScriptHandler.Select) as Promise<string | void>
}

export function runScript(options: RunScriptOptions) {
  return ipcRenderer.invoke(ScriptHandler.Run, options) as Promise<void>
}

export function analyzeScript(scriptPath: string) {
  return ipcRenderer.invoke(
    ScriptHandler.Analyze,
    scriptPath
  ) as Promise<K6TestOptions>
}

export function runScriptFromGenerator(options: RunScriptFromGeneratorOptions) {
  return ipcRenderer.invoke(
    ScriptHandler.RunFromGenerator,
    options
  ) as Promise<void>
}

export function saveScript(scriptPath: string, script: string) {
  return ipcRenderer.invoke(ScriptHandler.Save, scriptPath, script) as Promise<
    string | undefined
  >
}

export function stopScript() {
  ipcRenderer.send(ScriptHandler.Stop)
}

export function onScriptLog(callback: (data: LogEntry) => void) {
  return createListener(ScriptHandler.Log, callback)
}

export function onScriptStarted(callback: () => void) {
  return createListener(ScriptHandler.Started, callback)
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

export function onBrowserAction(callback: (data: BrowserActionEvent) => void) {
  return createListener(ScriptHandler.BrowserAction, callback)
}

export function onBrowserReplay(
  callback: (events: BrowserReplayEvent[]) => void
) {
  return createListener(ScriptHandler.BrowserReplay, callback)
}
