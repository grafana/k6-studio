import { css } from '@emotion/react'
import { Box, IconButton } from '@radix-ui/themes'
import { CollapsibleSection } from '../CollapsibleSection'
import { Pencil1Icon } from '@radix-ui/react-icons'

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
      <CollapsibleSection
        defaultOpen
        content={<Box>{children}</Box>}
        actions={
          <IconButton variant="ghost">
            <Pencil1Icon />
          </IconButton>
        }
      >
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
