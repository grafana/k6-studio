import { css } from '@emotion/react'
import { ReactNode } from 'react'

import { Popover } from '@/components/primitives/Popover'

interface ElementPopoverProps {
  open?: boolean
  anchor: ReactNode
  header: ReactNode
  children?: ReactNode
  onOpenChange?: (open: boolean) => void
}

export function ElementPopover({
  open,
  anchor,
  header,
  children,
  onOpenChange,
}: ElementPopoverProps) {
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Anchor asChild>{anchor}</Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          sideOffset={8}
          css={css`
            gap: var(--studio-spacing-1);
            padding: var(--studio-spacing-1);
            font-size: var(--studio-font-size-1);
          `}
        >
          <Popover.Arrow />
          <h1
            css={css`
              display: flex;
              align-self: stretch;
              justify-content: center;
              min-width: 250px;
              margin: 0;
              margin-bottom: var(--studio-spacing-1);
              padding: var(--studio-spacing-1);
              border-bottom: 1px solid var(--studio-border-color);
              font-size: var(--studio-font-size-1);
            `}
          >
            {header}
          </h1>
          <div>{children}</div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
