import { css } from '@emotion/react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { ReactNode } from 'react'

import { Flex } from '@/components/primitives/Flex'
import { IconButton } from '@/components/primitives/IconButton'
import { Popover } from '@/components/primitives/Popover'
import { Tooltip } from '@/components/primitives/Tooltip'

import { TrackedElement } from './utils'

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
  className?: string
  children: ReactNode
}

ElementPopover.Heading = function PopoverHeading(props: PopoverHeadingProps) {
  return (
    <h1
      {...props}
      css={css`
        display: flex;
        align-self: stretch;
        justify-content: center;
        min-width: 250px;
        margin: 0;
        padding: var(--studio-spacing-1);
        font-size: var(--studio-font-size-1);
      `}
    />
  )
}

interface ElementSelectorProps {
  element: TrackedElement
  onExpand?: () => void
  onContract?: () => void
}

ElementPopover.Selector = function ElementSelector({
  element,
  onExpand,
  onContract,
}: ElementSelectorProps) {
  return (
    <Flex align="center" gap="1">
      <Tooltip asChild content="Select parent element">
        <IconButton disabled={onExpand === undefined} onClick={onExpand}>
          <ChevronLeftIcon />
        </IconButton>
      </Tooltip>
      <ElementPopover.Heading
        css={css`
          flex: 1 1 0;
        `}
      >
        {element.target.selectors.css}
      </ElementPopover.Heading>
      <Tooltip asChild content="Select child element">
        <IconButton disabled={onContract === undefined} onClick={onContract}>
          <ChevronRightIcon />
        </IconButton>
      </Tooltip>
    </Flex>
  )
}
