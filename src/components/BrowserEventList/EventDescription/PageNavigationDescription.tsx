import { css } from '@emotion/react'
import { forwardRef, MouseEvent } from 'react'

import { Tooltip } from '@/components/primitives/Tooltip'
import { NavigateToPageEvent } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'
import { useIsRecording } from '@/views/Recorder/RecordingContext'

interface RemoteLinkProps {
  url: string
  onClick: (url: string) => void
}

const RemoteLink = forwardRef<HTMLElement, RemoteLinkProps>(function RemoteLink(
  { url, onClick },
  ref
) {
  const isRecording = useIsRecording()

  const handleClick = (ev: MouseEvent<HTMLAnchorElement>) => {
    ev.preventDefault()

    onClick(url)
  }

  const element = <strong ref={ref}>{url}</strong>

  if (!isRecording) {
    return (
      <Tooltip asChild content={url}>
        {element}
      </Tooltip>
    )
  }

  return (
    <Tooltip asChild content={url}>
      <a
        css={css`
          cursor: pointer;

          &:hover {
            text-decoration: underline;
          }
        `}
        onClick={handleClick}
      >
        {element}
      </a>
    </Tooltip>
  )
})

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
