import { Callout } from '@radix-ui/themes'
import { InfoIcon } from 'lucide-react'

export function AutocorrelationStep() {
  return (
    <Callout.Root color="gray">
      <Callout.Icon>
        <InfoIcon size={16} />
      </Callout.Icon>
      <Callout.Text>Autocorrelation is not available yet.</Callout.Text>
    </Callout.Root>
  )
}
