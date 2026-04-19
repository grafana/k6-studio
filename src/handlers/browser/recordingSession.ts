import type { BrowserWindow } from 'electron'

import { sendBridgeEventToClient } from '@/bridge/hub'
import { waitForProxy } from '@/main/proxy'
import { launchBrowser } from '@/recorder/launch'
import { BrowserLaunchError } from '@/recorder/launchers/types'
import type { LaunchBrowserOptions } from '@/recorder/types'
import type { BrowserEvent } from '@/schemas/recording'

import { BrowserHandler, type LaunchBrowserError } from './types'

export interface RecordingUiSink {
  sendBrowserEvent(events: BrowserEvent[]): void
  sendError(payload: LaunchBrowserError): void
  sendClosed(): void
}

export function createRendererRecordingSink(
  browserWindow: BrowserWindow
): RecordingUiSink {
  return {
    sendBrowserEvent(events: BrowserEvent[]) {
      browserWindow.webContents.send(BrowserHandler.BrowserEvent, events)
    },
    sendError(payload: LaunchBrowserError) {
      browserWindow.webContents.send(BrowserHandler.Error, payload)
    },
    sendClosed() {
      browserWindow.webContents.send(BrowserHandler.Closed)
    },
  }
}

export function createBridgeRecordingSink(
  bridgeClientId: string
): RecordingUiSink {
  return {
    sendBrowserEvent(events: BrowserEvent[]) {
      sendBridgeEventToClient(bridgeClientId, BrowserHandler.BrowserEvent, [
        events,
      ])
    },
    sendError(payload: LaunchBrowserError) {
      sendBridgeEventToClient(bridgeClientId, BrowserHandler.Error, [payload])
    },
    sendClosed() {
      sendBridgeEventToClient(bridgeClientId, BrowserHandler.Closed, [])
    },
  }
}

export async function runRecordingSessionWithSink(
  sink: RecordingUiSink,
  options: LaunchBrowserOptions
): Promise<void> {
  await waitForProxy()

  try {
    k6StudioState.currentRecordingSession = await launchBrowser(options)

    k6StudioState.currentRecordingSession.on('record', (event) => {
      sink.sendBrowserEvent(event.events)
    })

    k6StudioState.currentRecordingSession.on('error', (error) => {
      console.error('An error occurred during recording: ', error)

      sink.sendError({
        reason: 'recording-session',
        fatal: false,
      })
    })

    k6StudioState.currentRecordingSession.on('stop', () => {
      sink.sendClosed()

      k6StudioState.currentRecordingSession = null
    })

    console.info('browser started')
  } catch (error) {
    console.error(
      'An unexpected error occurred while starting recording: ',
      error
    )

    if (error instanceof BrowserLaunchError) {
      sink.sendError({
        reason: error.source,
        fatal: true,
      })

      return
    }

    sink.sendError({
      reason: 'unknown',
      fatal: true,
    })
  }
}
