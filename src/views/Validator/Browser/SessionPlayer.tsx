import 'node_modules/rrweb/dist/style.min.css'

import { css } from '@emotion/react'
import { Flex, IconButton, Slider } from '@radix-ui/themes'
import { PauseIcon, PlayIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Replayer, ReplayerEvents } from 'rrweb'

import { DebugSession } from '../types'

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

    player.startLive()

    player.on(ReplayerEvents.Finish, () => {
      console.log('Replay finished')
    })

    player.on(ReplayerEvents.Pause, () => {
      console.log('Replay paused')
      setPlaying(false)
    })

    player.on(ReplayerEvents.PlayBack, () => {
      console.log('Replay playback')
    })

    player.on(ReplayerEvents.Resume, () => {
      console.log('Replay resumed')
      setPlaying(true)
    })

    player.on(ReplayerEvents.Start, () => {
      console.log('Replay started')
      setPlaying(true)
    })

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

  // useEffect(() => {
  //   if (!playing) {
  //     return
  //   }

  //   const handle = setInterval(() => {
  //     const currentTime = replayerRef.current?.getCurrentTime() ?? 0
  //     const { totalTime = 0 } = replayerRef.current?.getMetaData() ?? {}

  //     setCurrentTime({
  //       current: Math.min(currentTime, totalTime),
  //       total: totalTime,
  //     })
  //   }, 200)

  //   return () => {
  //     clearInterval(handle)
  //   }
  // }, [playing])

  const handleSeek = ([newTime = 0]: number[]) => {
    playerRef.current?.play(newTime)

    setPlaying(true)
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
        <div ref={setMount}></div>
      </div>
      <Flex p="2" align="center" gap="4">
        <IconButton
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
          value={[currentTime.current]}
          min={0}
          max={10000}
          onValueChange={handleSeek}
        />
      </Flex>
    </Flex>
  )
}
