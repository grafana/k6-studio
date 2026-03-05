import { ipcRenderer } from 'electron'
import * as path from 'pathe'
import invariant from 'tiny-invariant'

import { BrowserActionEvent, BrowserReplayEvent } from '@/main/runner/schema'
import { Check, LogEntry } from '@/schemas/k6'

import { Script } from '../cloud/types'
import { open as openFile, save } from '../file/preload'
import { FileLocation } from '../file/types'
import { createListener } from '../utils'

import { OpenScriptResult, ScriptHandler } from './types'

export function showScriptSelectDialog() {
  return ipcRenderer.invoke(ScriptHandler.Select) as Promise<string | void>
}

export function analyzeScript(location: FileLocation) {
  return ipcRenderer.invoke(ScriptHandler.Analyze, location) as Promise<
    OpenScriptResult['options']
  >
}

export async function openScript(
  scriptPath: string
): Promise<OpenScriptResult> {
  const location = path.isAbsolute(scriptPath)
    ? { type: 'path' as const, path: scriptPath }
    : { type: 'legacy' as const, name: scriptPath }

  const result = await openFile({
    location,
    fileType: 'script',
  })

  invariant(result.type === 'script', 'Expected script content')

  const options = await analyzeScript(location)

  return {
    script: result.content,
    options,
    isExternal: result.isExternal,
  }
}

export function saveScript(script: string, fileName: string) {
  return save({
    content: { type: 'script', content: script },
    location: { type: 'legacy', name: fileName },
  })
}

export function runScript(script: Script, shouldTrack = true) {
  return ipcRenderer.invoke(
    ScriptHandler.Run,
    script,
    shouldTrack
  ) as Promise<void>
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
