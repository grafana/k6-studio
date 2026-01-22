import 'node_modules/rrweb/dist/style.min.css'

import { css } from '@emotion/react'
import { Flex, Spinner, Box } from '@radix-ui/themes'
import { useState } from 'react'

import { DebugSession } from '../../types'

import { AddressBar } from './AddressBar'
import { OnSeekEvent, PlaybackControls } from './PlaybackControls'
import { usePlayer } from './SessionPlayer.hooks'
import { Viewport } from './Viewport'

interface SessionPlayerProps {
  session: DebugSession
}

export function SessionPlayer({ session }: SessionPlayerProps) {
  const [mount, setMount] = useState<HTMLDivElement | null>(null)

  const { loading, state, time, page, play, pause, seek } = usePlayer({
    streaming: session.state === 'running',
    mount,
    events: session.browser.replay,
  })

  const handleSeek = ({ time, commit }: OnSeekEvent) => {
    seek(time, { scrubbing: !commit })
  }

  const handlePlay = () => {
    play()
  }

  const handlePause = () => {
    pause()
  }

  // While streaming, we won't know the size of the first page until the
  // initial frames arrive. To avoid showing a zero-size viewport, we hide
  // it and show a spinner instead.
  const hasWindowDimensions = page === undefined

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
        {hasWindowDimensions && <Spinner size="2" />}
        <Viewport show={page !== undefined}>
          <AddressBar loading={loading} page={page} />
          <Box
            position="relative"
            style={{
              minWidth: page?.width,
              minHeight: page?.height,
            }}
          >
            <div
              ref={setMount}
              style={{
                display: loading ? 'none' : 'block',
              }}
            />
          </Box>
        </Viewport>
      </div>
      <PlaybackControls
        state={state}
        streaming={session.state === 'running'}
        currentTime={time.current}
        totalTime={time.total}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeek={handleSeek}
      />
    </Flex>
  )
}
