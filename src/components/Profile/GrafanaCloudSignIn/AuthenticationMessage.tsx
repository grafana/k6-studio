import { css } from '@emotion/react'
import { Callout } from '@radix-ui/themes'
import { ReactNode } from 'react'

interface AuthenticationMessageProps {
  error?: boolean
  children: ReactNode
}

export function AuthenticationMessage({
  error = false,
  children,
}: AuthenticationMessageProps) {
  return (
    <Callout.Root
      color={error ? 'red' : undefined}
      css={css`
        justify-content: center;
      `}
    >
      <Callout.Text align="center">{children}</Callout.Text>
    </Callout.Root>
  )
}
