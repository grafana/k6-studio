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
            padding: var(--studio-spacing-1);
            font-size: var(--studio-font-size-1);
          `}
        >
          <Popover.Arrow />
          <div
            css={css`
              border-bottom: 1px solid var(--studio-border-color);
              margin-bottom: var(--studio-spacing-1);
            `}
          >
            {header}
          </div>
          <div>{children}</div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

interface PopoverHeadingProps {
  children: ReactNode
}

ElementPopover.Heading = function PopoverHeading({
  children,
}: PopoverHeadingProps) {
  return (
    <h1
      css={css`
        display: flex;
        align-self: stretch;
        justify-content: center;
        min-width: 250px;
        margin: 0;
        padding: var(--studio-spacing-1);
        font-size: var(--studio-font-size-1);
      `}
    >
      {children}
    </h1>
  )
}
