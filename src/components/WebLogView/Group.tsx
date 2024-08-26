import { css } from '@emotion/react'
import { Box } from '@radix-ui/themes'
import { CollapsibleSection } from '../CollapsibleSection'

export function Group({
  name,
  length,
  children,
}: {
  name: string
  length: number
  children: React.ReactNode
}) {
  return (
    <Box pb="2">
      <CollapsibleSection content={<Box>{children}</Box>} defaultOpen>
        <span
          css={css`
            font-size: 13px;
            font-weight: 500;
          `}
        >
          {name} ({length})
        </span>
      </CollapsibleSection>
    </Box>
  )
}
