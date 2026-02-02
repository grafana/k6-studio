import { css } from '@emotion/react'
import { Button, Callout, Flex } from '@radix-ui/themes'
import { InfoIcon } from 'lucide-react'
import { useLocalStorage } from 'react-use'

import { ExternalLink } from '@/components/ExternalLink'

export function Banner() {
  const [isDismissed, setIsDismissed] = useLocalStorage(
    'feb2026-banner-dismissed',
    false
  )

  if (isDismissed) {
    return null
  }

  return (
    <Callout.Root
      color="indigo"
      m="4"
      css={css`
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        display: flex;
        align-items: center;
      `}
    >
      <Callout.Icon>
        <InfoIcon size={16} />
      </Callout.Icon>{' '}
      <Callout.Text>
        Help us improve Grafana k6 Studio. Share your experience and help shape
        future improvements.
      </Callout.Text>
      <Flex ml="auto" gap="2">
        <Button
          variant="outline"
          onClick={() => {
            setIsDismissed(true)
          }}
        >
          Dismiss
        </Button>
        <ExternalLink
          href="https://www.userinterviews.com/projects/XwPjeHBAbA/apply"
          onClick={() => {
            setIsDismissed(true)
          }}
        >
          <Button css={{ whiteSpace: 'nowrap' }}>Take survey</Button>
        </ExternalLink>
      </Flex>
    </Callout.Root>
  )
}
