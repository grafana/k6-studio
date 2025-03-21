import { css } from '@emotion/react'
import { Flex } from '@radix-ui/themes'
import { ReactNode } from 'react'

import grot from '@/assets/grot-tea.svg'
import { LoadingMessage } from '@/components/Profile/LoadingMessage'

interface LoadingProps {
  children: ReactNode
}

export function Loading({ children }: LoadingProps) {
  return (
    <Flex direction="column" align="center" justify="center">
      <div>
        <img
          css={css`
            width: 200px;
            transform: scaleX(-1);
          `}
          src={grot}
          alt="Grot drinking tea."
        />
      </div>
      <LoadingMessage>{children}</LoadingMessage>
    </Flex>
  )
}
