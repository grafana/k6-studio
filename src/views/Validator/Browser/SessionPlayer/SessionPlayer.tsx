import 'node_modules/rrweb/dist/style.min.css'

import { css } from '@emotion/react'
import { Flex, Spinner, Box } from '@radix-ui/themes'
import { useState } from 'react'

import { DebugSession } from '../../types'

import { AddressBar } from './AddressBar'
import { OnSeekEvent, PlaybackControls } from './PlaybackControls'
import { usePlayer } from './SessionPlayer.hooks'
import { Viewport } from './Viewport'
import { Page } from './types'

type PageState =
  /** We're streaming, but haven't received the first page yet. */
  | 'waiting-for-initial'
  /** We have a page, but we're still waiting on the first frame for it. */
  | 'transitioning'
  /** We've received the first frame for the page and can start showing the content. */
  | 'loaded'
  /** The session ended without any page loads. */
  | 'no-page'

const DEFAULT_PAGE: Page = {
  href: 'about:blank',
  title: 'k6 Studio',
  // Same default size as k6/browser
  width: 1280,
  height: 720,
}

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

  const pageState: PageState =
    session.state === 'stopped' && page === undefined
      ? 'no-page'
      : page === undefined
        ? 'waiting-for-initial'
        : loading
          ? 'transitioning'
          : 'loaded'

  const pageWithFallback = page ?? DEFAULT_PAGE

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
        {pageState === 'waiting-for-initial' && <Spinner size="2" />}
        <Viewport show={pageState !== 'waiting-for-initial'}>
          <AddressBar
            loading={pageState === 'transitioning'}
            page={pageWithFallback}
          />
          <Box
            position="relative"
            style={{
              minWidth: pageWithFallback.width,
              minHeight: pageWithFallback.height,
            }}
          >
            <div
              ref={setMount}
              style={{
                display: pageState !== 'loaded' ? 'none' : 'block',
              }}
            />
          </Box>
        </Viewport>
      </div>
      <PlaybackControls
        state={state}
        streaming={session.state === 'running'}
        time={time}
        actions={session.browser.actions}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeek={handleSeek}
      />
    </Flex>
  )
}
