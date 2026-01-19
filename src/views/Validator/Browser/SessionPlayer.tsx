import 'node_modules/rrweb/dist/style.min.css'

import { css } from '@emotion/react'
import { Flex, IconButton, Slider, Text } from '@radix-ui/themes'
import { PauseIcon, PlayIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Replayer, ReplayerEvents } from 'rrweb'

import { DebugSession } from '../types'

import { useViewportScale } from './SessionPlayer.hooks'

function useThrottleGate(delay: number) {
  const lastRunRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const canRun = () => {
    const now = Date.now()

    if (now - lastRunRef.current >= delay) {
      lastRunRef.current = now
      return true
    }

    return false
  }

  const runWhenPossible = (callback: () => void) => {
    if (canRun()) {
      callback()
      return
    }

    if (timeoutRef.current !== null) {
      return
    }

    const timeToNextRun = delay - (Date.now() - lastRunRef.current)

    timeoutRef.current = setTimeout(() => {
      lastRunRef.current = Date.now()
      timeoutRef.current = null
      callback()
    }, timeToNextRun)
  }

  return runWhenPossible
}

function formatTime(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  const minutesStr = minutes.toString().padStart(2, '0')
  const secondsStr = seconds.toString().padStart(2, '0')

  return `${minutesStr}:${secondsStr}`
}

type PlayerState = 'playing' | 'paused' | 'ended'
type PlayMode = 'streaming' | 'normal'

interface SessionPlayerProps {
  session: DebugSession
}

export function SessionPlayer({ session }: SessionPlayerProps) {
  const [mount, setMount] = useState<HTMLDivElement | null>(null)

  const [mode, setMode] = useState<PlayMode>(
    session.state === 'running' ? 'streaming' : 'normal'
  )

  const [state, setState] = useState<PlayerState>(
    session.state === 'running' ? 'playing' : 'paused'
  )

  const playerRef = useRef<Replayer | null>(null)
  const lastIndexRef = useRef(0)

  const offset = useRef(0)

  const [currentTime, setCurrentTime] = useState(0)
  const [totalTime, setTotalTime] = useState(0)

  const throttle = useThrottleGate(500)

  const scale = useViewportScale(mount)

  useEffect(() => {
    if (mount === null || playerRef.current !== null) {
      return
    }

    if (session.browser.replay.length < 2) {
      return
    }

    const player = new Replayer(session.browser.replay, {
      root: mount,
      liveMode: true,
      mouseTail: false,
    })

    player.on(ReplayerEvents.Finish, () => {
      setState('ended')
    })

    player.on(ReplayerEvents.Pause, () => {
      setState('paused')
    })

    player.on(ReplayerEvents.Resume, () => {
      setState('playing')
    })

    player.on(ReplayerEvents.Start, () => {
      setState('playing')
    })

    player.play()

    playerRef.current = player
    lastIndexRef.current = session.browser.replay.length
  }, [session.browser.replay, mount])

  useEffect(() => {
    if (mode === 'streaming' && session.state === 'stopped') {
      playerRef.current?.setConfig({
        liveMode: false,
      })

      playerRef.current?.pause(totalTime - offset.current)

      setCurrentTime(totalTime - offset.current)

      setMode('normal')
      setState('ended')
    }
  }, [mode, totalTime, session.state])

  useEffect(() => {
    if (playerRef.current === null) {
      return
    }

    for (let i = lastIndexRef.current; i < session.browser.replay.length; i++) {
      const event = session.browser.replay[i]

      if (event === undefined) {
        continue
      }

      playerRef.current.addEvent(event)
    }

    lastIndexRef.current = session.browser.replay.length
  }, [session.browser.replay])

  useEffect(() => {
    if (state !== 'playing') {
      return
    }

    let frame = requestAnimationFrame(function tick() {
      const currentTime = playerRef.current?.getCurrentTime() ?? 0

      setCurrentTime(currentTime)

      frame = requestAnimationFrame(tick)
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [state])

  useEffect(() => {
    if (session.state !== 'running') {
      return
    }

    let frame = requestAnimationFrame(function tick() {
      const { totalTime = 0 } = playerRef.current?.getMetaData() ?? {}

      setTotalTime(totalTime)

      if (state === 'playing') {
        setCurrentTime(totalTime - offset.current)
      }

      frame = requestAnimationFrame(tick)
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [session.state, state])

  const handlePositionChange = ([newTime]: number[]) => {
    if (newTime === undefined) {
      return
    }

    if (session.state === 'running') {
      offset.current = totalTime - newTime

      return
    }

    throttle(() => {
      playerRef.current?.pause(newTime)
    })

    setCurrentTime(newTime)
  }

  const handlePositionCommit = ([newTime]: number[]) => {
    if (newTime === undefined) {
      return
    }

    if (session.state === 'running') {
      offset.current = totalTime - newTime

      return
    }

    if (state === 'playing') {
      playerRef.current?.play(newTime)
    } else {
      playerRef.current?.pause(newTime)
    }

    setCurrentTime(newTime)
  }

  return (
    <Flex direction="column" height="100%" width="100%">
      <div
        css={css`
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;

          flex: 1 1 0;

          iframe {
            border: none;
          }
        `}
      >
        <div
          css={css`
            border: 1px solid var(--gray-a5);
          `}
          ref={setMount}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `scale(${scale}) translate(-50%, -50%)`,
            transformOrigin: 'top left',
          }}
        ></div>
      </div>
      <Flex
        css={css`
          background-color: var(--gray-2);
          border-top: 1px solid var(--gray-a5);
        `}
        py="2"
        px="4"
        align="center"
        gap="4"
      >
        <IconButton
          css={css`
            svg {
              fill: var(--accent-11);
              width: 14px !important;
              height: 14px !important;
              min-width: 14px !important;
              min-height: 14px !important;
              stroke-width: 3 !important;
              stroke-linecap: butt !important;
              stroke-linejoin: round;
            }
          `}
          variant="ghost"
          size="1"
          radius="full"
          onClick={() => {
            if (state !== 'paused') {
              playerRef.current?.pause()

              return
            }

            playerRef.current?.play(currentTime)
          }}
        >
          {state !== 'paused' && <PauseIcon />}
          {state === 'paused' && <PlayIcon />}
        </IconButton>
        <Slider
          size="1"
          value={[currentTime]}
          step={0.001}
          min={0}
          max={totalTime}
          onValueChange={handlePositionChange}
          onValueCommit={handlePositionCommit}
        />
        <Text
          asChild
          size="1"
          css={css`
            white-space: nowrap;
          `}
        >
          <Flex align="center" justify="end" minWidth="80px">
            {formatTime(currentTime)} / {formatTime(totalTime)}
          </Flex>
        </Text>
      </Flex>
    </Flex>
  )
}
