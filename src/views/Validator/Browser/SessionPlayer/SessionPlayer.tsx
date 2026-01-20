import 'node_modules/rrweb/dist/style.min.css'

import { css } from '@emotion/react'
import { Flex } from '@radix-ui/themes'
import { useEffect, useRef, useState } from 'react'
import { Replayer, ReplayerEvents } from 'rrweb'

import { DebugSession } from '../../types'

import { OnSeekEvent, PlaybackControls } from './PlaybackControls'
import {
  usePlayerEvent,
  useReplayEventSync,
  useViewportScale,
} from './SessionPlayer.hooks'

type PlayerState = 'playing' | 'paused' | 'ended'
type PlayMode = 'streaming' | 'normal'

interface SessionPlayerProps {
  session: DebugSession
}

export function SessionPlayer({ session }: SessionPlayerProps) {
  const [mount, setMount] = useState<HTMLDivElement | null>(null)
  const [player, setPlayer] = useState<Replayer | null>(null)

  const [mode, setMode] = useState<PlayMode>(
    session.state === 'running' ? 'streaming' : 'normal'
  )

  const [state, setState] = useState<PlayerState>(
    session.state === 'running' ? 'playing' : 'paused'
  )

  const offset = useRef(0)

  const [currentTime, setCurrentTime] = useState(0)
  const [totalTime, setTotalTime] = useState(0)

  const scale = useViewportScale(mount)

  useEffect(() => {
    if (mount === null || player !== null) {
      return
    }

    if (session.browser.replay.length < 2) {
      return
    }

    const newPlayer = new Replayer(session.browser.replay, {
      root: mount,
      liveMode: true,
      mouseTail: false,
    })

    newPlayer.play()

    setPlayer(newPlayer)
  }, [player, mount, session.browser.replay])

  useReplayEventSync(player, session.browser.replay)

  usePlayerEvent(ReplayerEvents.Finish, {
    player,
    handler: () => {
      setState('ended')
    },
    dependencies: [],
  })

  usePlayerEvent(ReplayerEvents.Pause, {
    player,
    handler: () => {
      setState('paused')
    },
    dependencies: [],
  })

  usePlayerEvent(ReplayerEvents.Resume, {
    player,
    handler: () => {
      setState('playing')
    },
    dependencies: [],
  })

  usePlayerEvent(ReplayerEvents.Start, {
    player,
    handler: () => {
      setState('playing')
    },
    dependencies: [],
  })

  useEffect(() => {
    if (mode === 'streaming' && session.state === 'stopped') {
      player?.setConfig({
        liveMode: false,
      })

      setCurrentTime(totalTime - offset.current)

      setMode('normal')
      setState('ended')

      player?.pause(totalTime - offset.current)
    }
  }, [player, mode, totalTime, session.state])

  useEffect(() => {
    if (state !== 'playing') {
      return
    }

    let frame = requestAnimationFrame(function tick() {
      const currentTime = player?.getCurrentTime() ?? 0

      setCurrentTime(currentTime)

      frame = requestAnimationFrame(tick)
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [player, state])

  useEffect(() => {
    if (session.state !== 'running') {
      return
    }

    let frame = requestAnimationFrame(function tick() {
      const { totalTime = 0 } = player?.getMetaData() ?? {}

      setTotalTime(totalTime)

      if (state === 'playing') {
        setCurrentTime(totalTime - offset.current)
      }

      frame = requestAnimationFrame(tick)
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [player, session.state, state])

  const handleSeek = ({ time, commit }: OnSeekEvent) => {
    setCurrentTime(time)

    if (!commit) {
      player?.pause(time)

      return
    }

    if (session.state === 'running') {
      offset.current = totalTime - time

      return
    }

    if (state === 'playing') {
      player?.play(time)
    } else {
      player?.pause(time)
    }
  }

  const handlePlay = () => {
    player?.play(currentTime)
  }

  const handlePause = () => {
    player?.pause()
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
      <PlaybackControls
        playing={state === 'playing'}
        currentTime={currentTime}
        totalTime={totalTime}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeek={handleSeek}
      />
    </Flex>
  )
}
