import { css } from '@emotion/react'
import {
  ContextMenu,
  Flex,
  Grid,
  IconButton,
  Reset,
  ScrollArea,
  Tooltip,
} from '@radix-ui/themes'
import { DiscIcon, GlobeIcon } from 'lucide-react'
import { useRef } from 'react'
import { NavLink } from 'react-router-dom'

import { useOverflowCheck } from '@/hooks/useOverflowCheck'
import { useRecentURLs } from '@/hooks/useRecentURLs'
import {
  StartRecordingNavigationState,
  useStartRecording,
} from '@/hooks/useStartRecording'
import { getRoutePath } from '@/routeMap'
import { useStudioUIStore } from '@/store/ui'

import { SidebarEmptyState } from './SidebarEmptyState'

export type { StartRecordingNavigationState }

export function RecentURLsPanel() {
  const { recentURLs, removeURL } = useRecentURLs()
  const startRecording = useStartRecording()
  const proxyStatus = useStudioUIStore((state) => state.proxyStatus)

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
                    disabled={proxyStatus !== 'online'}
                    onStartRecording={startRecording}
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
  disabled?: boolean
  onStartRecording: (url: string) => void
  onRemove: (url: string) => void
}

function RecentURLItem({
  url,
  disabled,
  onStartRecording,
  onRemove,
}: RecentURLItemProps) {
  const linkRef = useRef<HTMLAnchorElement>(null)
  const hasOverflow = useOverflowCheck(linkRef)

  const navigationState: StartRecordingNavigationState = {
    prefilledURL: url,
  }

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <Grid
          asChild
          columns="min-content 1fr auto"
          align="center"
          pl="3"
          pr="2"
          css={css`
            position: relative;
            gap: var(--space-2);
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
          <li>
            <GlobeIcon color="var(--indigo-9)" />
            <Tooltip
              content={url}
              side="right"
              sideOffset={32}
              hidden={!hasOverflow}
            >
              <NavLink
                ref={linkRef}
                to={getRoutePath('recorder')}
                state={navigationState}
                css={css`
                  display: block;
                  padding: var(--space-1) 0;
                  font-size: 12px;
                  line-height: 22px;
                  color: var(--gray-11);
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  text-decoration: none;

                  &::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                  }

                  &:focus-visible::after {
                    outline: 2px solid var(--focus-8);
                    outline-offset: -1px;
                    border-radius: 4px;
                  }
                `}
              >
                {url}
              </NavLink>
            </Tooltip>
            <Tooltip content="Start recording">
              <IconButton
                variant="ghost"
                color="gray"
                size="1"
                aria-label={`Start recording ${url}`}
                disabled={disabled}
                css={css`
                  position: relative;
                  z-index: 1;
                `}
                onClick={() => onStartRecording(url)}
              >
                <DiscIcon />
              </IconButton>
            </Tooltip>
          </li>
        </Grid>
      </ContextMenu.Trigger>
      <ContextMenu.Content size="1">
        <ContextMenu.Item
          disabled={disabled}
          onClick={() => onStartRecording(url)}
        >
          Start recording
        </ContextMenu.Item>
        <ContextMenu.Item color="red" onClick={() => onRemove(url)}>
          Remove
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}
