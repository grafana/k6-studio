import { css } from '@emotion/react'
import { Table as RadixTable } from '@radix-ui/themes'
import { ComponentProps } from 'react'

function ColumnHeaderCell(
  props: ComponentProps<typeof RadixTable.ColumnHeaderCell>
) {
  return (
    <RadixTable.ColumnHeaderCell
      {...props}
      css={css`
        color: var(--gray-11);
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
      `}
    />
  )
}

export const Table = {
  ...RadixTable,
  ColumnHeaderCell,
}
