import { css } from '@emotion/react'
import { Flex, Popover } from '@radix-ui/themes'

import { BrowserActionEvent } from '@/main/runner/schema'

import { BrowserActionStatusIcon } from '../../BrowserActionStatusIcon'
import { BrowserActionText } from '../../BrowserActionText'

interface TimelineTooltipProps {
  offset: number
  action: BrowserActionEvent | undefined
}

export function TimelineTooltip({ offset, action }: TimelineTooltipProps) {
  return (
    <Popover.Root open={action !== undefined}>
      <Popover.Trigger key={offset}>
        <div
          css={css`
            position: absolute;
            top: 0;
            width: 0;
            height: 0;
          `}
          style={{
            left: `${offset}%`,
          }}
        />
      </Popover.Trigger>
      <Popover.Content asChild side="top" align="center" size="1">
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
                <BrowserActionStatusIcon event={action} />
                <BrowserActionText action={action.action} />
              </Flex>
            </Flex>
          )}
        </Flex>
      </Popover.Content>
    </Popover.Root>
  )
}
