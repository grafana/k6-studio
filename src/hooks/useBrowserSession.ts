import { useCallback, useEffect, useState } from 'react'

import { createReplayEvent } from '@/main/runner/rrweb'
import {
  BrowserDebuggerEvent,
  BrowserReplayEvent,
  isBrowserActionEvent,
} from '@/main/runner/schema'

interface BrowserSession {
  actions: BrowserDebuggerEvent[]
  replay: BrowserReplayEvent[]
}

export function useBrowserSession() {
  const [browserSession, setBrowserSession] = useState<BrowserSession>({
    actions: [],
    replay: [],
  })

  useEffect(() => {
    return window.studio.script.onBrowserAction(
      (event: BrowserDebuggerEvent) => {
        if (event.state === 'begin') {
          setBrowserSession((session) => ({
            ...session,
            actions: [...session.actions, event],
            replay: [
              ...session.replay,
              createReplayEvent({
                tag: 'action-begin',
                payload: {
                  actionId: event.eventId,
                },
                timestamp: event.timestamp.started,
              }),
            ],
          }))

          return
        }

        setBrowserSession((session) => ({
          ...session,
          actions: session.actions.map((action) =>
            action.eventId === event.eventId ? event : action
          ),
          replay: [
            ...session.replay,
            createReplayEvent({
              tag: 'action-end',
              payload: {
                actionId: event.eventId,
              },
              timestamp: event.timestamp.ended,
            }),
          ],
        }))
      }
    )
  }, [])

  useEffect(() => {
    return window.studio.script.onBrowserReplay((events) => {
      setBrowserSession((session) => ({
        ...session,
        replay: [...session.replay, ...events],
      }))
    })
  }, [])

  useEffect(() => {
    return window.studio.script.onScriptStopped(() => {
      setBrowserSession((session) => {
        const now = Date.now()

        // Abort all actions that were running when the script stopped.
        const actions = session.actions.map((action) => {
          if (action.state !== 'begin' || !isBrowserActionEvent(action)) {
            return action
          }

          return {
            ...action,
            state: 'end' as const,
            timestamp: {
              ...action.timestamp,
              ended: now,
            },
            result: {
              type: 'aborted' as const,
            },
          }
        })

        // Insert action end events for all actions that were running when the script stopped.
        const actionEnds = session.actions
          .filter(
            (action) => action.state === 'begin' && isBrowserActionEvent(action)
          )
          .map((action) =>
            createReplayEvent({
              tag: 'action-end',
              payload: {
                actionId: action.eventId,
              },
              timestamp: now,
            })
          )

        return {
          ...session,
          actions,
          replay: [
            ...session.replay,
            ...actionEnds,
            createReplayEvent({
              tag: 'recording-end',
              payload: {},
              timestamp: now,
            }),
          ],
        }
      })
    })
  }, [])

  const resetBrowserSession = useCallback(() => {
    setBrowserSession({
      actions: [],
      replay: [],
    })
  }, [])

  return {
    browserSession,
    resetBrowserSession,
  }
}
