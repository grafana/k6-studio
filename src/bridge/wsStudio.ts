import { nanoid } from 'nanoid'

import type { BridgeServerMessage } from '@/bridge/protocol'
import {
  BrowserHandler,
  type LaunchBrowserError,
} from '@/handlers/browser/types'
import { GeneratorHandler } from '@/handlers/generator/types'
import { HarHandler } from '@/handlers/har/types'
import { ProxyHandler } from '@/handlers/proxy/types'
import { ScriptHandler } from '@/handlers/script/types'
import { SettingsHandler } from '@/handlers/settings/types'
import { UIHandler } from '@/handlers/ui/types'
import { ValidatorRunHandler } from '@/handlers/validatorRun/types'
import type { Studio } from '@/preload'
import type { LaunchBrowserOptions } from '@/recorder/types'
import type { BrowserEvent, Recording } from '@/schemas/recording'
import type { ProxyData, ProxyStatus, StudioFile } from '@/types'
import type { GeneratorFileData } from '@/types/generator'
import type { AppSettings } from '@/types/settings'
import { runValidatorSession as runValidatorSessionImpl } from '@/utils/runValidatorSession'

type Pending = {
  resolve: (value: unknown) => void
  reject: (error: Error) => void
}

function asSub<T>(fn: (payload: T) => void) {
  return (payload: unknown) => fn(payload as T)
}

function connectBridge(url: string, timeoutMs = 5000): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url)
    const timer = window.setTimeout(() => {
      ws.close()
      reject(new Error(`Studio bridge connection timed out (${url})`))
    }, timeoutMs)

    function onHandshake(ev: MessageEvent) {
      try {
        const msg = JSON.parse(ev.data as string) as BridgeServerMessage
        if (msg.type === 'ready') {
          window.clearTimeout(timer)
          ws.removeEventListener('message', onHandshake)
          resolve(ws)
        }
      } catch {
        window.clearTimeout(timer)
        ws.removeEventListener('message', onHandshake)
        reject(new Error('Invalid bridge handshake'))
      }
    }

    ws.addEventListener('message', onHandshake)
    ws.onerror = () => {
      window.clearTimeout(timer)
      ws.removeEventListener('message', onHandshake)
      reject(new Error('Studio bridge socket error'))
    }
  })
}

function buildWsRuntime(ws: WebSocket) {
  const pending = new Map<string, Pending>()
  const listeners = new Map<string, Set<(payload: unknown) => void>>()

  function routeMessage(ev: MessageEvent) {
    let msg: BridgeServerMessage
    try {
      msg = JSON.parse(ev.data as string) as BridgeServerMessage
    } catch {
      return
    }

    if (msg.type === 'reply') {
      const slot = pending.get(msg.id)
      if (!slot) return
      pending.delete(msg.id)
      if (msg.ok) {
        slot.resolve(msg.result)
      } else {
        slot.reject(new Error(msg.error ?? 'Bridge error'))
      }
      return
    }

    if (msg.type === 'event') {
      const payload =
        msg.args.length <= 1 ? msg.args[0] : (msg.args as unknown)
      const set = listeners.get(msg.channel)
      set?.forEach((cb) => cb(payload))
    }
  }

  ws.addEventListener('message', routeMessage)

  function invoke<T>(channel: string, args: unknown[] = []): Promise<T> {
    const id = nanoid()
    return new Promise((resolve, reject) => {
      pending.set(id, {
        resolve: (value: unknown) => resolve(value as T),
        reject,
      })
      ws.send(JSON.stringify({ type: 'invoke', id, channel, args }))
    })
  }

  function send(channel: string, args: unknown[] = []) {
    ws.send(JSON.stringify({ type: 'send', channel, args }))
  }

  function subscribe(channel: string, handler: (payload: unknown) => void) {
    let set = listeners.get(channel)
    if (!set) {
      set = new Set()
      listeners.set(channel, set)
    }
    set.add(handler)
    return () => {
      set.delete(handler)
    }
  }

  return { invoke, send, subscribe }
}

/**
 * Overlay remote Electron-main handlers over the offline browser stub so that
 * validator, proxy, workspace files, etc. work when the desktop app exposes a bridge.
 */
export function createBridgedStudio(ws: WebSocket, offline: Studio): Studio {
  const rt = buildWsRuntime(ws)

  const noopUnsub = () => {}

  return {
    ...offline,
    proxy: {
      launchProxy: () => rt.invoke<void>(ProxyHandler.Start),
      stopProxy: () => rt.send(ProxyHandler.Stop),
      onProxyData: (callback: (data: ProxyData) => void) =>
        rt.subscribe(ProxyHandler.Data, asSub(callback)),
      getProxyStatus: () =>
        rt.invoke<ProxyStatus>(ProxyHandler.GetStatus),
      onProxyStatusChange: (callback: (status: ProxyStatus) => void) =>
        rt.subscribe(ProxyHandler.ChangeStatus, asSub(callback)),
      checkProxyHealth: () =>
        rt.invoke<boolean>(ProxyHandler.CheckHealth),
    },

    browser: {
      launchBrowser: (options: LaunchBrowserOptions) =>
        rt.invoke<void>(BrowserHandler.Start, [options]),
      stopBrowser: () => rt.send(BrowserHandler.Stop),
      onBrowserClosed: (callback: () => void) =>
        rt.subscribe(BrowserHandler.Closed, () => callback()),
      onBrowserLaunchError: (callback: (reason: LaunchBrowserError) => void) =>
        rt.subscribe(BrowserHandler.Error, asSub(callback)),
      onBrowserEvent: (callback: (event: BrowserEvent[]) => void) =>
        rt.subscribe(BrowserHandler.BrowserEvent, asSub(callback)),
      openExternalLink: (url: string) =>
        rt.invoke<void>(BrowserHandler.OpenExternalLink, [url]),
    },

    script: {
      showScriptSelectDialog: () =>
        rt.invoke<string | void>(ScriptHandler.Select),
      openScript: (scriptPath: string) =>
        rt.invoke(ScriptHandler.Open, [scriptPath]),
      runScriptFromGenerator: (script: string, shouldTrack = true) =>
        rt.invoke<void>(ScriptHandler.RunFromGenerator, [
          script,
          shouldTrack,
        ]),
      saveScript: (script: string, fileName: string) =>
        rt.invoke<void>(ScriptHandler.Save, [script, fileName]),
      runScript: (scriptPath: string) =>
        rt.invoke<void>(ScriptHandler.Run, [scriptPath]),
      stopScript: () => rt.send(ScriptHandler.Stop),
      onScriptLog: (
        callback: (data: import('@/schemas/k6').LogEntry) => void
      ) => rt.subscribe(ScriptHandler.Log, asSub(callback)),
      onScriptStarted: (callback: () => void) =>
        rt.subscribe(ScriptHandler.Started, callback),
      onScriptStopped: (callback: () => void) =>
        rt.subscribe(ScriptHandler.Stopped, callback),
      onScriptFinished: (callback: () => void) =>
        rt.subscribe(ScriptHandler.Finished, callback),
      onScriptFailed: (callback: () => void) =>
        rt.subscribe(ScriptHandler.Failed, callback),
      onScriptCheck: (
        callback: (data: import('@/schemas/k6').Check[]) => void
      ) => rt.subscribe(ScriptHandler.Check, asSub(callback)),
      onBrowserAction: (
        callback: (data: import('@/main/runner/schema').BrowserActionEvent) => void
      ) => rt.subscribe(ScriptHandler.BrowserAction, asSub(callback)),
      onBrowserReplay: (
        callback: (events: import('@/main/runner/schema').BrowserReplayEvent[]) => void
      ) => rt.subscribe(ScriptHandler.BrowserReplay, asSub(callback)),
      runValidatorSession: runValidatorSessionImpl,
    },

    settings: {
      getSettings: () => rt.invoke<AppSettings>(SettingsHandler.Get),
      saveSettings: (settings: AppSettings) =>
        rt.invoke(SettingsHandler.Save, [settings]),
      selectBrowserExecutable: () =>
        rt.invoke(SettingsHandler.SelectBrowserExecutable),
      selectUpstreamCertificate: () =>
        rt.invoke(SettingsHandler.SelectUpstreamCertificate),
      isEncryptionAvailable: () =>
        rt.invoke<boolean>(SettingsHandler.IsEncryptionAvailable),
    },

    ui: {
      ...offline.ui,
      detectBrowser: () =>
        rt.invoke<boolean>(UIHandler.DetectBrowser),
      getFiles: () => rt.invoke(UIHandler.GetFiles),
      reportIssue: () => rt.invoke<void>(UIHandler.ReportIssue),
      onAddFile: (callback: (file: StudioFile) => void) =>
        rt.subscribe(UIHandler.AddFile, asSub(callback)),
      onRemoveFile: (callback: (file: StudioFile) => void) =>
        rt.subscribe(UIHandler.RemoveFile, asSub(callback)),
      onToast: () => noopUnsub,
    },

    generator: {
      createGenerator: (recordingPath: string) =>
        rt.invoke<string>(GeneratorHandler.Create, [recordingPath]),
      saveGenerator: (generator: GeneratorFileData, fileName: string) =>
        rt.invoke<void>(GeneratorHandler.Save, [generator, fileName]),
      loadGenerator: (fileName: string) =>
        rt.invoke<GeneratorFileData>(GeneratorHandler.Open, [fileName]),
    },

    har: {
      saveFile: (data: Recording, prefix: string) =>
        rt.invoke<string | undefined>(HarHandler.SaveFile, [data, prefix]),
      openFile: (filePath: string) =>
        rt.invoke<Recording>(HarHandler.OpenFile, [filePath]),
      importFile: offline.har.importFile,
    },

    validatorRun: {
      saveSession: (
        data: Recording,
        runSourceLabel: string,
        startedAtMs: number
      ) =>
        rt.invoke<string | undefined>(ValidatorRunHandler.SaveSession, [
          data,
          runSourceLabel,
          startedAtMs,
        ]),
      openFile: (fileName: string) =>
        rt.invoke<Recording>(ValidatorRunHandler.OpenFile, [fileName]),
    },

  } as unknown as Studio
}

export async function connectStudioBridge(
  url: string
): Promise<WebSocket | undefined> {
  try {
    return await connectBridge(url)
  } catch {
    return undefined
  }
}
