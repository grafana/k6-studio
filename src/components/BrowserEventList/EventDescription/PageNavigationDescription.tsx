import { css } from '@emotion/react'
import { MouseEvent } from 'react'

import { Tooltip } from '@/components/primitives/Tooltip'
import { NavigateToPageEvent } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'
import { useIsRecording } from '@/views/Recorder/RecordingContext'

const ellipsis = css`
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

interface RemoteLinkProps {
  url: string
  onClick: (url: string) => void
}

function RemoteLink({ url, onClick }: RemoteLinkProps) {
  const isRecording = useIsRecording()

  const handleClick = (ev: MouseEvent<HTMLAnchorElement>) => {
    ev.preventDefault()

    onClick(url)
  }

  if (!isRecording) {
    return (
      <Tooltip asChild content={url}>
        <strong css={ellipsis}>{url}</strong>
      </Tooltip>
    )
  }

  return (
    <Tooltip asChild content={url}>
      <a
        css={[
          ellipsis,
          css`
            font-weight: bold;
            cursor: pointer;

            &:hover {
              text-decoration: underline;
            }
          `,
        ]}
        onClick={handleClick}
      >
        {url}
      </a>
    </Tooltip>
  )
}

interface PageNavigationDescriptionProps {
  event: NavigateToPageEvent
  onNavigate: (url: string) => void
}

export function PageNavigationDescription({
  event,
  onNavigate,
}: PageNavigationDescriptionProps) {
  const url = <RemoteLink url={event.url} onClick={onNavigate} />

  switch (event.source) {
    case 'address-bar':
      return <>Navigated to {url}</>

    case 'history':
      return <>Navigated to {url} using the browser history</>

    case 'implicit':
      return <>Navigated to {url} after a user action</>

    default:
      return exhaustive(event.source)
  }
}
