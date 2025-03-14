import { NavigatedToPageEvent } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'
import { css } from '@emotion/react'
import { Tooltip, Strong, Link } from '@radix-ui/themes'
import { forwardRef, MouseEvent } from 'react'
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

  const element = <Strong ref={ref}>{url}</Strong>

  if (!isRecording) {
    return element
  }

  return (
    <Link
      css={css`
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      `}
      onClick={handleClick}
    >
      {element}
    </Link>
  )
})

interface PageNavigationDescriptionProps {
  event: NavigatedToPageEvent
  onNavigate: (url: string) => void
}

export function PageNavigationDescription({
  event,
  onNavigate,
}: PageNavigationDescriptionProps) {
  const url = (
    <Tooltip content={event.url}>
      <RemoteLink url={event.url} onClick={onNavigate} />
    </Tooltip>
  )

  switch (event.source) {
    case 'address-bar':
      return <>Navigated to {url}</>

    case 'history':
      return <>Navigated to {url} using the browser history</>

    default:
      return exhaustive(event.source)
  }
}
