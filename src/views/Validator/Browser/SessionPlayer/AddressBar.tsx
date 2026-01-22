import { css } from '@emotion/react'
import { Flex, Spinner, Text } from '@radix-ui/themes'
import { GlobeIcon } from 'lucide-react'

import { Page } from './types'

interface AddressBarProps {
  loading: boolean
  page: Page | undefined
}

export function AddressBar({ loading, page }: AddressBarProps) {
  return (
    <Flex
      css={css`
        background-color: var(--gray-2);
      `}
      p="2"
      align="center"
    >
      <Text asChild size="1">
        <Flex
          css={css`
            flex: 1 1 0;
            background-color: var(--color-background);
            border-radius: var(--radius-2);
          `}
          gap="2"
          p="2"
        >
          <GlobeIcon />
          <span
            css={css`
              flex: 1;
            `}
          >
            {page?.href}
          </span>
          {loading && <Spinner />}
        </Flex>
      </Text>
    </Flex>
  )
}
