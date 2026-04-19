import { BrowserWindow, shell } from 'electron'
import log from 'electron-log/main'
import { readFile, unlink, writeFile } from 'fs/promises'
import path from 'path'
import invariant from 'tiny-invariant'

import { createBridgeScriptSink } from '@/bridge/sinks'
import {
  INVALID_FILENAME_CHARS,
  K6_GENERATOR_FILE_EXTENSION,
} from '@/constants/files'
import {
  GENERATORS_PATH,
  RECORDINGS_PATH,
  SCRIPTS_PATH,
  TEMP_GENERATOR_SCRIPT_PATH,
  VALIDATOR_RUNS_PATH,
} from '@/constants/workspace'
import {
  createBridgeRecordingSink,
  runRecordingSessionWithSink,
} from '@/handlers/browser/recordingSession'
import { BrowserHandler } from '@/handlers/browser/types'
import { GeneratorHandler } from '@/handlers/generator/types'
import { HarHandler } from '@/handlers/har/types'
import { ProxyHandler } from '@/handlers/proxy/types'
import { getScriptTestRun, setScriptTestRun } from '@/handlers/script/state'
import { ScriptHandler } from '@/handlers/script/types'
import { SettingsHandler } from '@/handlers/settings/types'
import { UIHandler } from '@/handlers/ui/types'
import { loadWorkspaceFiles } from '@/handlers/ui/workspaceFiles'
import { ValidatorRunHandler } from '@/handlers/validatorRun/types'
import { isEncryptionAvailable } from '@/main/encryption'
import { checkProxyHealth } from '@/main/healthCheck'
import {
  launchProxyAndAttachEmitter,
  stopProxyProcess,
  waitForProxy,
} from '@/main/proxy'
import { runScriptWithSink } from '@/main/script'
import {
  applySettings,
  getSettings,
  saveSettings,
  selectBrowserExecutable,
  selectUpstreamCertificate,
} from '@/main/settings'
import type { LaunchBrowserOptions } from '@/recorder/types'
import { GeneratorFileDataSchema } from '@/schemas/generator'
import { RecordingSchema , Recording } from '@/schemas/recording'
import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { GeneratorFileData } from '@/types/generator'
import { AppSettings } from '@/types/settings'
import { getBrowserPath } from '@/utils/browser'
import { reportNewIssue } from '@/utils/bugReport'
import {
  createFileWithUniqueName,
  createValidatorRunHarFile,
} from '@/utils/fileSystem'
import { createNewGeneratorFile } from '@/utils/generator'
import { K6Client } from '@/utils/k6/client'
import { isExternalScript } from '@/utils/workspace'

function mainWindowOrThrow(): BrowserWindow {
  const win = BrowserWindow.getAllWindows()[0]
  if (!win) {
    throw new Error(
      'No Grafana k6 Studio window is open — keep the desktop app running while using the web UI bridge.'
    )
  }
  return win
}

function sanitizeValidatorRunLabel(label: string) {
  const trimmed = label.replace(INVALID_FILENAME_CHARS, '_').trim()
  return trimmed.slice(0, 120) || 'Validator run'
}

export async function dispatchBridgeInvoke(
  channel: string,
  args: unknown[] | undefined,
  clientId: string
): Promise<unknown> {
  const a = args ?? []

  switch (channel) {
    case ScriptHandler.Select:
      return undefined

    case ScriptHandler.Open: {
      const scriptPath = a[0] as string
      const absolute = path.isAbsolute(scriptPath)
      const resolvedScriptPath = absolute
        ? scriptPath
        : path.join(SCRIPTS_PATH, scriptPath)

      const script = await readFile(resolvedScriptPath, {
        encoding: 'utf-8',
        flag: 'r',
      })

      const options = await new K6Client()
        .inspect({ scriptPath: resolvedScriptPath })
        .catch(() => ({}))

      return {
        script,
        options: options ?? {},
        isExternal: isExternalScript(resolvedScriptPath),
      }
    }

    case ScriptHandler.Run: {
      await waitForProxy()
      const scriptPath = a[0] as string
      const absolute = path.isAbsolute(scriptPath)
      const resolvedScriptPath = absolute
        ? scriptPath
        : path.join(SCRIPTS_PATH, scriptPath)

      setScriptTestRun(
        await runScriptWithSink({
          scriptPath: resolvedScriptPath,
          proxySettings: k6StudioState.appSettings.proxy,
          usageReport: k6StudioState.appSettings.telemetry.usageReport,
          sink: createBridgeScriptSink(clientId),
        })
      )

      trackEvent({
        event: UsageEventName.ScriptValidated,
        payload: {
          isExternal: isExternalScript(resolvedScriptPath),
        },
      })

      return undefined
    }

    case ScriptHandler.RunFromGenerator: {
      await waitForProxy()
      const script = a[0] as string
      const shouldTrack = (a[1] as boolean | undefined) ?? true

      await writeFile(TEMP_GENERATOR_SCRIPT_PATH, script)

      setScriptTestRun(
        await runScriptWithSink({
          scriptPath: TEMP_GENERATOR_SCRIPT_PATH,
          proxySettings: k6StudioState.appSettings.proxy,
          usageReport: k6StudioState.appSettings.telemetry.usageReport,
          sink: createBridgeScriptSink(clientId),
        })
      )

      if (shouldTrack) {
        trackEvent({
          event: UsageEventName.ScriptValidated,
          payload: {
            isExternal: false,
          },
        })
      }

      await unlink(TEMP_GENERATOR_SCRIPT_PATH)
      return undefined
    }

    case ScriptHandler.Save: {
      const script = a[0] as string
      const fileName = (a[1] as string | undefined) ?? 'script.js'
      const filePath = path.join(SCRIPTS_PATH, fileName)
      await writeFile(filePath, script)
      trackEvent({
        event: UsageEventName.ScriptExported,
      })
      return undefined
    }

    case ProxyHandler.Start: {
      const win = mainWindowOrThrow()
      k6StudioState.currentProxyProcess =
        await launchProxyAndAttachEmitter(win)
      return undefined
    }

    case ProxyHandler.GetStatus:
      return k6StudioState.proxyStatus

    case ProxyHandler.CheckHealth:
      return checkProxyHealth()

    case SettingsHandler.Get:
      return getSettings()

    case SettingsHandler.Save: {
      const data = a[0] as AppSettings
      const win = mainWindowOrThrow()
      const { windowState: _, ...settings } = data
      const modifiedSettings = await saveSettings(settings)
      await applySettings(modifiedSettings, win)
      return getSettings()
    }

    case SettingsHandler.SelectBrowserExecutable:
      return selectBrowserExecutable()

    case SettingsHandler.SelectUpstreamCertificate:
      return selectUpstreamCertificate()

    case SettingsHandler.IsEncryptionAvailable:
      return isEncryptionAvailable()

    case UIHandler.DetectBrowser: {
      try {
        const browserPath = await getBrowserPath(
          k6StudioState.appSettings.recorder
        )
        return browserPath !== ''
      } catch {
        log.error('Failed to find browser executable')
        return false
      }
    }

    case UIHandler.GetFiles:
      return loadWorkspaceFiles()

    case UIHandler.ReportIssue:
      return reportNewIssue()

    case GeneratorHandler.Create: {
      const recordingPath = a[0] as string
      const generator = createNewGeneratorFile(recordingPath)
      const fileName = await createFileWithUniqueName({
        data: JSON.stringify(generator, null, 2),
        directory: GENERATORS_PATH,
        ext: K6_GENERATOR_FILE_EXTENSION,
        prefix: 'Generator',
      })
      trackEvent({
        event: UsageEventName.GeneratorCreated,
      })
      return fileName
    }

    case GeneratorHandler.Save: {
      const generator = a[0] as GeneratorFileData
      const fileName = a[1] as string
      invariant(!INVALID_FILENAME_CHARS.test(fileName), 'Invalid file name')
      await writeFile(
        path.join(GENERATORS_PATH, fileName),
        JSON.stringify(generator, null, 2)
      )
      return undefined
    }

    case GeneratorHandler.Open: {
      const fileName = a[0] as string
      const data = await readFile(path.join(GENERATORS_PATH, fileName), {
        encoding: 'utf-8',
        flag: 'r',
      })
      return GeneratorFileDataSchema.parse(JSON.parse(data))
    }

    case HarHandler.SaveFile: {
      const data = a[0] as Recording
      const prefix = a[1] as string
      const parsed = RecordingSchema.parse(data)
      const fileName = await createFileWithUniqueName({
        data: JSON.stringify(parsed, null, 2),
        directory: RECORDINGS_PATH,
        ext: '.har',
        prefix,
      })
      trackEvent({
        event: UsageEventName.RecordingCreated,
      })
      return fileName
    }

    case HarHandler.OpenFile: {
      const fileName = a[0] as string
      const raw = await readFile(path.join(RECORDINGS_PATH, fileName), {
        encoding: 'utf-8',
        flag: 'r',
      })
      return RecordingSchema.parse(JSON.parse(raw))
    }

    case ValidatorRunHandler.SaveSession: {
      const data = a[0] as Recording
      const runSourceLabel = a[1] as string
      const startedAtMs = a[2] as number

      const parsed = RecordingSchema.parse(data)

      if (!parsed.log.entries?.length) {
        return undefined
      }

      const startedAt =
        Number.isFinite(startedAtMs) && startedAtMs > 0
          ? new Date(startedAtMs)
          : new Date()

      return createValidatorRunHarFile({
        rootDirectory: VALIDATOR_RUNS_PATH,
        startedAt,
        sourceLabel: sanitizeValidatorRunLabel(runSourceLabel),
        data: JSON.stringify(parsed, null, 2),
      })
    }

    case ValidatorRunHandler.OpenFile: {
      const fileName = a[0] as string
      const raw = await readFile(path.join(VALIDATOR_RUNS_PATH, fileName), {
        encoding: 'utf-8',
        flag: 'r',
      })
      return RecordingSchema.parse(JSON.parse(raw))
    }

    case BrowserHandler.Start: {
      await runRecordingSessionWithSink(
        createBridgeRecordingSink(clientId),
        a[0] as LaunchBrowserOptions
      )
      return undefined
    }

    case BrowserHandler.OpenExternalLink: {
      const raw = a[0] as string
      try {
        const parsed = new URL(raw)
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          throw new Error('Only http(s) URLs can be opened externally')
        }
        return shell.openExternal(parsed.toString())
      } catch {
        throw new Error('Invalid URL')
      }
    }

    default:
      throw new Error(`Unsupported bridge invoke channel: ${channel}`)
  }
}

export function dispatchBridgeSend(
  channel: string,
  args: unknown[] | undefined
): void {
  switch (channel) {
    case ScriptHandler.Stop: {
      const run = getScriptTestRun()
      if (run) {
        run.stop().catch((error) => {
          log.error('Failed to stop the test run', error)
        })
        setScriptTestRun(null)
      }
      return
    }

    case ProxyHandler.Stop:
      k6StudioState.wasProxyStoppedByClient = true
      void stopProxyProcess()
      return

    case BrowserHandler.Stop:
      k6StudioState.currentRecordingSession?.stop()
      k6StudioState.currentRecordingSession = null
      return

    default:
      log.warn(`Unsupported bridge send channel: ${channel}`)
  }
}
