import { css } from '@emotion/react'
import { Flex } from '@radix-ui/themes'
import { useState } from 'react'
import { SignInState } from './ProfileState/types'
import { ProfileState } from './ProfileState'

export function Profile() {
  const [state, setState] = useState<SignInState>({
    type: 'loading',
  })

  return (
    <Flex justify="center" align="center" height="100%">
      <Flex
        css={css`
          transform: translateY(-25%);
        `}
        minHeight="350px"
      >
        <ProfileState state={state} onStateChange={setState} />
      </Flex>
    </Flex>
  )
}
