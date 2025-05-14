import { css } from '@emotion/react'
import { Flex } from '@radix-ui/themes'
import { User2Icon } from 'lucide-react'

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
        font-size: 64px;
      `}
    >
      <User2Icon />
    </Flex>
  )
}
