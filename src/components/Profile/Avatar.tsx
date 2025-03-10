import { css } from '@emotion/react'
import { PersonIcon } from '@radix-ui/react-icons'
import { Flex } from '@radix-ui/themes'

export function Avatar() {
  return (
    <Flex
      align="center"
      justify="center"
      css={css`
        width: 100px;
        height: 100px;
        border: 4px solid var(--accent-9);
        color: var(--accent-9);
        border-radius: 50%;
      `}
    >
      <PersonIcon width="64px" height="64px" />
    </Flex>
  )
}
