import { css } from '@emotion/react'
import { Flex } from '@radix-ui/themes'
import type { ComponentProps } from 'react'

import { SearchField } from '@/components/SearchField'

export type SidebarSearchFieldProps = Omit<
  ComponentProps<typeof SearchField>,
  'css'
>

export function SidebarSearchField({ ...props }: SidebarSearchFieldProps) {
  return (
    <Flex
      css={css`
        border-bottom: 1px solid var(--gray-5);
      `}
      align="center"
      gap="2"
      px="3"
      py="2"
    >
      <SearchField
        variant="soft"
        color="gray"
        css={css`
          flex: 1 1 0;
        `}
        {...props}
      />
    </Flex>
  )
}
