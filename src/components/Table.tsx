import { css } from '@emotion/react'
import { Table as RadixTable } from '@radix-ui/themes'
import { ComponentProps } from 'react'

function ColumnHeaderCell({
  uppercase = true,
  ...props
}: ComponentProps<typeof RadixTable.ColumnHeaderCell> & {
  uppercase?: boolean
}) {
  return (
    <RadixTable.ColumnHeaderCell
      {...props}
      css={css`
        color: var(--gray-11);
        font-size: 10px;
        font-weight: 600;
        text-transform: ${uppercase ? 'uppercase' : 'none'};
      `}
    />
  )
}

export const Table = {
  ...RadixTable,
  ColumnHeaderCell,
}
