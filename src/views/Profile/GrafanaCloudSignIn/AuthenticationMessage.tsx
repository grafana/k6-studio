import { css } from '@emotion/react'
import { Callout } from '@radix-ui/themes'
import { ReactNode } from 'react'

interface AuthenticationMessageProps {
  children: ReactNode
}

export function AuthenticationMessage({
  children,
}: AuthenticationMessageProps) {
  return (
    <Callout.Root
      css={css`
        justify-content: center;
      `}
    >
      <Callout.Text align="center">{children}</Callout.Text>
    </Callout.Root>
  )
}
