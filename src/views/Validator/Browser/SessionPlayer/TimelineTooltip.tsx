import { css } from '@emotion/react'
import { Flex, Popover } from '@radix-ui/themes'

import { BrowserActionEvent } from '@/main/runner/schema'

import { BrowserActionStatusIcon } from '../BrowserActionStatusIcon'
import { BrowserActionText } from '../BrowserActionText'

import { Time } from './types'

interface TimelineTooltipProps {
  disabled?: boolean
  time: Time
  hoverTime: number | null
  actions: BrowserActionEvent[]
}

export function TimelineTooltip({
  disabled,
  time,
  hoverTime,
  actions,
}: TimelineTooltipProps) {
  return (
    <Popover.Root open={!disabled && hoverTime !== null && actions.length > 0}>
      <Popover.Trigger key={hoverTime}>
        <div
          css={css`
            position: absolute;
            top: 0;
            width: 0;
            height: 0;
          `}
          style={{
            left: hoverTime
              ? `${((hoverTime - time.start) / time.total) * 100}%`
              : 0,
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
          {hoverTime &&
            actions.map((action) => (
              <Flex
                key={action.eventId}
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
            ))}
        </Flex>
      </Popover.Content>
    </Popover.Root>
  )
}
