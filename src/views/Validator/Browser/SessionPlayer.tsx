import 'node_modules/rrweb/dist/style.min.css'

import { css } from '@emotion/react'
import { Flex, IconButton, Slider, Text } from '@radix-ui/themes'
import { PauseIcon, PlayIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Replayer, ReplayerEvents } from 'rrweb'

import { DebugSession } from '../types'

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

interface SessionPlayerProps {
  session: DebugSession
}

export function SessionPlayer({ session }: SessionPlayerProps) {
  const [mount, setMount] = useState<HTMLDivElement | null>(null)

  const playerRef = useRef<Replayer | null>(null)
  const lastIndexRef = useRef(0)

  const [playing, setPlaying] = useState(false)

  const [currentTime, setCurrentTime] = useState({
    current: 0,
    total: 0,
  })

  const throttle = useThrottleGate(500)

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
    })

    player.on(ReplayerEvents.Finish, () => {
      setPlaying(false)
    })

    player.on(ReplayerEvents.Pause, () => {
      setPlaying(false)
    })

    player.on(ReplayerEvents.Resume, () => {
      setPlaying(true)
    })

    player.on(ReplayerEvents.Start, () => {
      setPlaying(true)
    })

    player.play()

    playerRef.current = player
    lastIndexRef.current = session.browser.replay.length

    setPlaying(true)
  }, [session.browser.replay, mount])

  useEffect(() => {
    if (session.state !== 'stopped') {
      playerRef.current?.setConfig({
        liveMode: false,
      })

      playerRef.current?.pause()
    }
  }, [session.state])

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
    if (!playing) {
      return
    }

    let frame = requestAnimationFrame(function tick() {
      const currentTime = playerRef.current?.getCurrentTime() ?? 0
      const { totalTime = 0 } = playerRef.current?.getMetaData() ?? {}

      setCurrentTime({
        current: currentTime,
        total: totalTime,
      })

      frame = requestAnimationFrame(tick)
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [playing])

  const handlePositionChange = ([newTime]: number[]) => {
    if (newTime === undefined) {
      return
    }

    throttle(() => {
      playerRef.current?.pause(newTime)
    })

    setCurrentTime({
      current: newTime,
      total: currentTime.total,
    })
  }

  const handlePositionCommit = ([newTime]: number[]) => {
    if (newTime === undefined) {
      return
    }

    if (playing) {
      playerRef.current?.play(newTime)
    } else {
      playerRef.current?.pause(newTime)
    }

    setCurrentTime({
      current: newTime,
      total: currentTime.total,
    })
  }

  return (
    <Flex direction="column" height="100%">
      <div
        css={css`
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
            if (playing) {
              playerRef.current?.pause()

              return
            }

            playerRef.current?.play(currentTime.current)
          }}
        >
          {playing && <PauseIcon />}
          {!playing && <PlayIcon />}
        </IconButton>
        <Slider
          size="1"
          value={[currentTime.current]}
          step={0.001}
          min={0}
          max={currentTime.total}
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
            {formatTime(currentTime.current)} / {formatTime(currentTime.total)}
          </Flex>
        </Text>
      </Flex>
    </Flex>
  )
}
