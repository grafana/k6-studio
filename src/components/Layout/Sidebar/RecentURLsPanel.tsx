import { css } from '@emotion/react'
import {
  ContextMenu,
  Flex,
  IconButton,
  Reset,
  ScrollArea,
  Tooltip,
} from '@radix-ui/themes'
import { DiscIcon, GlobeIcon } from 'lucide-react'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from 'react-use'

import { useOverflowCheck } from '@/hooks/useOverflowCheck'
import { useRecentURLs } from '@/hooks/useRecentURLs'
import { LaunchBrowserOptions } from '@/recorder/types'
import { getRoutePath } from '@/routeMap'

import { SidebarEmptyState } from './SidebarEmptyState'

export interface StartRecordingNavigationState {
  autoStart: LaunchBrowserOptions
}

export function RecentURLsPanel() {
  const { recentURLs, removeURL } = useRecentURLs()
  const navigate = useNavigate()
  const [captureBrowser = true] = useLocalStorage(
    'start-recording.capture.browser',
    true
  )

  const handleStartRecording = (url: string) => {
    const state: StartRecordingNavigationState = {
      autoStart: {
        url,
        capture: { browser: captureBrowser },
      },
    }
    navigate(getRoutePath('recorder'), { state })
  }

  return (
    <Flex direction="column" height="100%" overflow="hidden">
      {recentURLs.length === 0 ? (
        <SidebarEmptyState message="URLs you record from will appear here." />
      ) : (
        <ScrollArea scrollbars="vertical">
          <Flex
            direction="column"
            pb="2"
            role="list"
            aria-label="Recent URLs"
            asChild
          >
            <Reset>
              <ul>
                {recentURLs.map((url) => (
                  <RecentURLItem
                    key={url}
                    url={url}
                    onStartRecording={handleStartRecording}
                    onRemove={removeURL}
                  />
                ))}
              </ul>
            </Reset>
          </Flex>
        </ScrollArea>
      )}
    </Flex>
  )
}

interface RecentURLItemProps {
  url: string
  onStartRecording: (url: string) => void
  onRemove: (url: string) => void
}

function RecentURLItem({
  url,
  onStartRecording,
  onRemove,
}: RecentURLItemProps) {
  const linkRef = useRef<HTMLLIElement>(null)
  const hasOverflow = useOverflowCheck(linkRef)

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <li
          ref={linkRef}
          css={css`
            display: grid;
            grid-template-columns: min-content 1fr auto;
            align-items: center;
            gap: var(--space-2);
            padding: var(--space-1) var(--space-2) var(--space-1) var(--space-3);
            font-size: 12px;
            line-height: 22px;
            color: var(--gray-11);

            & > button {
              opacity: 0;
              width: 0;
              overflow: hidden;
              padding-inline: 0;
              pointer-events: none;
            }

            &:hover > button,
            & > button:focus,
            & > button[data-state='open'] {
              opacity: 1;
              width: auto;
              overflow: visible;
              padding-inline: revert;
              pointer-events: auto;
            }

            &:hover {
              background-color: var(--gray-a2);
            }
          `}
        >
          <GlobeIcon color="var(--indigo-9)" />
          <Tooltip
            content={url}
            side="right"
            sideOffset={32}
            hidden={!hasOverflow}
          >
            <span
              ref={linkRef}
              css={css`
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              `}
            >
              {url}
            </span>
          </Tooltip>
          <Tooltip content="Start recording">
            <IconButton
              variant="ghost"
              color="gray"
              size="1"
              aria-label={`Start recording ${url}`}
              onClick={() => onStartRecording(url)}
            >
              <DiscIcon />
            </IconButton>
          </Tooltip>
        </li>
      </ContextMenu.Trigger>
      <ContextMenu.Content size="1">
        <ContextMenu.Item onClick={() => onStartRecording(url)}>
          Start recording
        </ContextMenu.Item>
        <ContextMenu.Item color="red" onClick={() => onRemove(url)}>
          Remove
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}
