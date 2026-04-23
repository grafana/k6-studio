import { css } from '@emotion/react'
import { Flex, Popover } from '@radix-ui/themes'
import { ReactNode } from 'react'

import { BrowserDebuggerEvent } from '@/main/runner/schema'
import { DebuggerEventStatusIcon } from '@/views/Validator/Browser/DebuggerEventStatusIcon'
import { DebuggerEventText } from '@/views/Validator/Browser/DebuggerEventText'

interface TimelineTooltipProps {
  open: boolean
  action: BrowserDebuggerEvent
  children: ReactNode
}

export function TimelineTooltip({
  open,
  action,
  children,
}: TimelineTooltipProps) {
  return (
    <Popover.Root open={open}>
      <Popover.Trigger>{children}</Popover.Trigger>
      <Popover.Content
        asChild
        css={css`
          min-width: unset;
        `}
        side="top"
        align="center"
        sideOffset={10}
        size="1"
      >
        <Flex
          css={css`
            font-size: var(--font-size-1);
            border-radius: var(--radius-2);
          `}
          direction="column"
          p="0"
        >
          {action !== undefined && (
            <Flex
              align="center"
              py="2"
              px="4"
              css={css`
                border-bottom: 1px solid var(--gray-5);

                &:last-child {
                  border-bottom: none;
                }

                min-height: 28px;
              `}
            >
              <Flex align="center" gap="2">
                <DebuggerEventStatusIcon event={action} />
                <DebuggerEventText event={action} />
              </Flex>
            </Flex>
          )}
        </Flex>
      </Popover.Content>
    </Popover.Root>
  )
}
