import { useEffect, useRef, useState } from 'react'
import { EventType, Replayer, ReplayerEvents } from 'rrweb'

import { parseReplayEvent } from '@/main/runner/rrweb'
import { BrowserReplayEvent } from '@/main/runner/schema'
import { DebugSession } from '@/views/Validator/types'

import { Page, PlaybackState } from './types'

function useEventSync(player: Replayer | null, events: BrowserReplayEvent[]) {
  const lastIndexRef = useRef<number | null>(null)

  useEffect(() => {
    if (player === null) {
      return
    }

    // If the player was just created, then the events are already loaded and
    // we keep track of the last index.
    if (lastIndexRef.current === null) {
      lastIndexRef.current = events.length

      return
    }

    for (let i = lastIndexRef.current; i < events.length; ++i) {
      const event = events[i]

      if (event === undefined) {
        continue
      }

      player.addEvent(event)
    }

    lastIndexRef.current = events.length
  }, [player, events])
}

class EnhancedReplayer extends Replayer {
  constructor(...args: ConstructorParameters<typeof Replayer>) {
    super(...args)
  }

  getStartTime() {
    return this.getMetaData().startTime
  }

  getEndTime() {
    return this.getMetaData().endTime
  }

  getTotalTime() {
    return this.getMetaData().totalTime
  }

  getCurrentTimestamp() {
    return this.getStartTime() + this.getCurrentTime()
  }
}

interface Pages {
  first: Page
  current: Page
}

interface UsePlayerOptions {
  session: DebugSession
  mount: HTMLDivElement | null
}

export function usePlayer({ session, mount }: UsePlayerOptions) {
  const events = session.browser.replay

  const [player, setPlayer] = useState<EnhancedReplayer | null>(null)

  // Start at 1 to make slider be 100% at the beginning of the session
  const [currentTime, setCurrentTime] = useState(1)

  const [state, setState] = useState<PlaybackState>(
    session.state === 'running' ? 'playing' : 'paused'
  )

  const [scrubbing, setScrubbing] = useState(false)

  const [pages, setPages] = useState<Pages | null>(null)

  useEventSync(player, session.browser.replay)

  useEffect(() => {
    // Initialize the rrweb Replayer instance once we have a mount point
    // and enough events to play.
    if (mount === null || player !== null) {
      return
    }

    if (session.state === 'pending' || events.length < 2) {
      return
    }

    const newPlayer = new EnhancedReplayer(events, {
      root: mount,
      liveMode: session.state === 'running',
      mouseTail: false,
    })

    newPlayer.on(ReplayerEvents.Finish, () => {
      setState('ended')
    })

    newPlayer.on(ReplayerEvents.CustomEvent, (ev) => {
      const parsedEvent = parseReplayEvent(ev)

      switch (parsedEvent.data.tag) {
        case 'recording-end':
          newPlayer.stopLive()
          newPlayer.setConfig({ liveMode: false })

          break

        case 'page-start': {
          const payload = parsedEvent.data.payload

          setPages((meta) => {
            return {
              first: meta?.first ?? payload,
              current: payload,
            }
          })
          break
        }
      }
    })

    if (session.state === 'running') {
      newPlayer.play()

      setState('playing')
    }

    setPlayer(newPlayer)
  }, [player, mount, session.state, events])

  // Keep track of the current time for non-streaming playback.
  useEffect(() => {
    if (session.state === 'running' || state !== 'playing' || scrubbing) {
      return
    }

    let frame = requestAnimationFrame(function tick() {
      const totalTime = player?.getTotalTime() ?? 0
      const currentTime = Math.min(player?.getCurrentTime() ?? 0, totalTime)

      setCurrentTime(currentTime)

      frame = requestAnimationFrame(tick)
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [player, state, session.state, scrubbing])

  // Keep track of the total time, as well as the current time, while streaming
  useEffect(() => {
    if (session.state !== 'running') {
      return
    }

    let frame = requestAnimationFrame(function tick() {
      const totalTime = player?.getTotalTime() ?? 0

      // We currently don't allow seeking and pausing while streaming, so
      // we keep the total time and the current time in sync.
      setCurrentTime(totalTime)

      frame = requestAnimationFrame(tick)
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [player, state, session.state])

  const totalTime = player?.getTotalTime() ?? 0

  const play = () => {
    switch (state) {
      case 'playing':
        break

      case 'paused':
        player?.play(currentTime)
        break

      case 'ended':
        player?.play(0)
        setCurrentTime(0)

        break
    }

    setState('playing')
  }

  const pause = () => {
    if (state !== 'playing') {
      return
    }

    player?.pause(currentTime)

    setState('paused')
  }

  const seek = (time: number, { scrubbing = false } = {}) => {
    const newCurrentTime = Math.min(time, totalTime)

    setCurrentTime(newCurrentTime)

    // The user is currently scrubbing the timeline. In this case, we pause
    // the playback so that it the current time is only updated by changes the
    // user moving the mouse.
    if (scrubbing) {
      setScrubbing(true)

      player?.pause(newCurrentTime)

      return
    }

    setScrubbing(false)

    if (newCurrentTime >= totalTime) {
      setState('ended')

      player?.pause(newCurrentTime)

      return
    }

    if (state !== 'playing') {
      player?.pause(newCurrentTime)

      setState('paused')
    } else {
      player?.play(newCurrentTime)

      setState('playing')
    }
  }

  const currentTimestamp = player?.getCurrentTimestamp() ?? 0
  const firstFrame = events.find((ev) => ev.type !== EventType.Custom)

  const hasRendered =
    firstFrame !== undefined && currentTimestamp >= firstFrame.timestamp

  const isBeforeFirstFrame =
    firstFrame !== undefined && currentTimestamp < firstFrame.timestamp

  return {
    loading: !hasRendered,
    state,
    time: {
      start: player?.getStartTime() ?? 0,
      end: player?.getEndTime() ?? 0,
      // rrweb can return a current time greater than total time so we
      // clamp it here to avoid issues in the UI.
      current: Math.min(currentTime, totalTime),
      total: totalTime,
    },
    page: isBeforeFirstFrame ? pages?.first : pages?.current,
    play,
    pause,
    seek,
    player,
  }
}
