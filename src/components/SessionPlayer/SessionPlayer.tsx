import 'node_modules/rrweb/dist/style.min.css'

import { css } from '@emotion/react'
import { Flex, Box } from '@radix-ui/themes'
import { ReactNode, useState } from 'react'

import { NodeSelector } from '@/schemas/selectors'
import { DebugSession } from '@/views/Validator/types'

import { AddressBar } from './AddressBar'
import { OnSeekEvent, PlaybackControls } from './PlaybackControls'
import { SelectorHighlights } from './SelectorHighlights'
import { usePlayer } from './SessionPlayer.hooks'
import { getPageState } from './SessionPlayer.utils'
import { Viewport } from './Viewport'
import { Page } from './types'

const DEFAULT_PAGE: Page = {
  href: 'about:blank',
  title: 'k6 Studio',
  // Same default size as k6/browser
  width: 1280,
  height: 720,
}

interface SessionPlayerProps {
  session: DebugSession
  placeholder?: string
  initialPage?: Page
  initialContent?: ReactNode
  highlightedSelector: NodeSelector | null
}

export function SessionPlayer({
  session,
  placeholder = 'Enter a URL to start...',
  initialPage = DEFAULT_PAGE,
  initialContent,
  highlightedSelector,
}: SessionPlayerProps) {
  const [mount, setMount] = useState<HTMLDivElement | null>(null)

  const { loading, state, time, page, play, pause, seek, player } = usePlayer({
    session,
    mount,
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

  const pageState = getPageState(session, page, loading)
  const pageWithFallback = page ?? initialPage

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
        <Viewport show>
          <AddressBar
            placeholder={placeholder}
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
            {pageState === 'pending' && (
              <Viewport.Message>{initialContent}</Viewport.Message>
            )}
            {pageState === 'waiting-for-initial' && (
              <Viewport.Message>
                Waiting for the initial page...
              </Viewport.Message>
            )}
            {pageState === 'no-page' && (
              <Viewport.Message>No page was loaded.</Viewport.Message>
            )}
            <div
              ref={setMount}
              style={{
                display: pageState !== 'loaded' ? 'none' : 'block',
              }}
            />
            {pageState === 'loaded' && (
              <SelectorHighlights
                player={player}
                selector={highlightedSelector ?? null}
              />
            )}
          </Box>
        </Viewport>
      </div>
      <PlaybackControls
        state={state}
        disabled={session.state === 'pending'}
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
