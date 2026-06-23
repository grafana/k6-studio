import 'node_modules/rrweb/dist/style.min.css'
import { css } from '@emotion/react'
import { Flex, Box } from '@radix-ui/themes'
import { ReactNode, useEffect, useState } from 'react'

import { isBrowserAssertion } from '@/main/runner/schema'
import { DebugSession } from '@/views/Validator/types'

import { HighlightTarget } from '../HighlightLocatorProvider'

import { AddressBar } from './AddressBar'
import { LocatorHighlights } from './LocatorHighlights'
import { OnSeekEvent, PlaybackControls } from './PlaybackControls'
import { usePlayerContext } from './PlayerContext'
import { PlayerMouseEvent, usePlayer } from './SessionPlayer.hooks'
import { getPageState } from './SessionPlayer.utils'
import { Page } from './types'
import { Viewport } from './Viewport'

const DEFAULT_PAGE: Page = {
  pageId: 'default',
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
  controls?: ReactNode
  highlightedElement: HighlightTarget
  interactive?: boolean
  onClick?: (ev: PlayerMouseEvent) => void
}

export function SessionPlayer({
  session,
  placeholder = 'Enter a URL to start...',
  initialPage = DEFAULT_PAGE,
  initialContent,
  controls,
  highlightedElement,
  interactive = false,
  onClick,
}: SessionPlayerProps) {
  const [mount, setMount] = useState<HTMLDivElement | null>(null)

  const { loading, state, time, page, play, pause, seek, player } = usePlayer({
    session,
    mount,
    interactive,
    onClick,
  })

  const { setPlayer } = usePlayerContext()

  useEffect(() => {
    setPlayer(player)

    return () => {
      setPlayer(null)
    }
  }, [player, setPlayer])

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
              <LocatorHighlights
                player={player}
                target={highlightedElement ?? null}
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
        actions={session.browser.actions.filter(
          (action) => action.type === 'action' || isBrowserAssertion(action)
        )}
        controls={controls}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeek={handleSeek}
      />
    </Flex>
  )
}
