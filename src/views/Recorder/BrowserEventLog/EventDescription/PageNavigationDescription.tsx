import { css } from '@emotion/react'
import { Tooltip, Strong, Link } from '@radix-ui/themes'
import { forwardRef, MouseEvent } from 'react'

import { NavigatedToPageEvent } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'
import { useIsRecording } from '@/views/Recorder/RecordingContext'

interface NavigationProps {
  url: string
}

const Navigation = forwardRef<HTMLElement, NavigationProps>(function Navigation(
  { url },
  ref
) {
  const isRecording = useIsRecording()

  const handleClick = (ev: MouseEvent<HTMLAnchorElement>) => {
    ev.preventDefault()

    window.studio.browserRemote.navigateTo(url)
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
}

export function PageNavigationDescription({
  event,
}: PageNavigationDescriptionProps) {
  const url = (
    <Tooltip content={event.url}>
      <Navigation url={event.url} />
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
