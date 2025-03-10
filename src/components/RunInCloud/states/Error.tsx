import { Callout } from '@radix-ui/themes'
import { ErrorState } from './types'

interface ErrorProps {
  state: ErrorState
}

export function Error(_props: ErrorProps) {
  return (
    <Callout.Root color="red">
      An unexpected error ocurred. Please try again.
    </Callout.Root>
  )
}
