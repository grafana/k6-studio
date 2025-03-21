import { css } from '@emotion/react'
import { Text, Flex } from '@radix-ui/themes'

import grotCrashed from '@/assets/grot-crashed.svg'

import { ErrorState } from './types'

interface ErrorProps {
  state: ErrorState
}

export function Error(_props: ErrorProps) {
  return (
    <Flex direction="column" align="center" justify="center">
      <div>
        <img
          css={css`
            width: 200px;
            transform: scaleX(-1);
          `}
          src={grotCrashed}
          alt="Image of Grot with crossed out eyes."
        />
      </div>
      <Text color="red">An unexpected error ocurred. Please try again.</Text>
    </Flex>
  )
}
