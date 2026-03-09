import { css } from '@emotion/react'
import { IconButton, Tooltip } from '@radix-ui/themes'
import { DiscIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { getRoutePath } from '@/routeMap'

interface SidebarRecentURLsProps {
  urls: string[]
}

export function SidebarRecentURLs({ urls }: SidebarRecentURLsProps) {
  const navigate = useNavigate()

  const handleStartRecording = (url: string) => {
    navigate(getRoutePath('recorder'), { state: { startUrl: url } })
  }

  if (urls.length === 0) {
    return (
      <span
        css={css`
          display: block;
          padding: var(--space-1) var(--space-1) var(--space-1) var(--space-4);
          font-size: 12px;
          color: var(--gray-9);
        `}
      >
        No recent URLs
      </span>
    )
  }

  return (
    <ul
      css={css`
        list-style: none;
        padding: 0;
        margin: var(--space-1) 0 0;
      `}
    >
      {urls.map((url) => (
        <li
          key={url}
          css={css`
            display: flex;
            align-items: center;
            gap: var(--space-1);
            padding: var(--space-1) var(--space-1) var(--space-1) var(--space-4);

            &:hover {
              background-color: var(--gray-4);
            }
          `}
        >
          <span
            css={css`
              flex: 1;
              font-size: 12px;
              color: var(--gray-11);
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            `}
            title={url}
          >
            {url}
          </span>
          <Tooltip content="Start recording" side="right">
            <IconButton
              size="1"
              variant="ghost"
              color="gray"
              aria-label="Start recording"
              onClick={() => handleStartRecording(url)}
            >
              <DiscIcon />
            </IconButton>
          </Tooltip>
        </li>
      ))}
    </ul>
  )
}
