import { useGeneratorStore } from '@/store/generator'
import { Callout, Text } from '@radix-ui/themes'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { TextButton } from '@/components/TextButton'

export function RulesNotAppliedCallout() {
  const previewOriginalRequests = useGeneratorStore(
    (store) => store.previewOriginalRequests
  )

  const setPreviewOriginalRequests = useGeneratorStore(
    (store) => store.setPreviewOriginalRequests
  )

  if (!previewOriginalRequests) {
    return null
  }

  function handleClick() {
    setPreviewOriginalRequests(false)
  }

  return (
    <Callout.Root color="red" size="1" m="1" mb="3" css={{}}>
      <Callout.Icon>
        <InfoCircledIcon />
      </Callout.Icon>
      <Callout.Text>
        <Text as="p">
          Requests are currently displayed without rules applied.
        </Text>
        <Text as="p">
          <TextButton onClick={handleClick}>
            Turn off the preview of original requests
          </TextButton>{' '}
          to see the effect of your rules.
        </Text>
      </Callout.Text>
    </Callout.Root>
  )
}
