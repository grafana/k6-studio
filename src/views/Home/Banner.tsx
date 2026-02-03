import { css } from '@emotion/react'
import { Button, Callout, Flex } from '@radix-ui/themes'
import { InfoIcon } from 'lucide-react'
import { useLocalStorage } from 'react-use'

export function Banner() {
  const [isDismissed, setIsDismissed] = useLocalStorage(
    'feb2026BannerDismissed',
    false
  )

  if (isDismissed) {
    return null
  }

  const handleTakeSurvey = async () => {
    await window.studio.browser.openExternalLink(
      'https://www.userinterviews.com/projects/XwPjeHBAbA/apply'
    )
    setIsDismissed(true)
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
      </Callout.Icon>
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
        <Button css={{ whiteSpace: 'nowrap' }} onClick={handleTakeSurvey}>
          Take survey
        </Button>
      </Flex>
    </Callout.Root>
  )
}
