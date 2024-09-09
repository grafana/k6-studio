import { K6Check } from '@/types'
import { css } from '@emotion/react'
import { Cross2Icon, CheckIcon } from '@radix-ui/react-icons'
import { Flex, Box, Tooltip, Text } from '@radix-ui/themes'
import { hasFailures, getPassPercentage } from './ChecksSection.utils'

export function CheckRow({ check }: { check: K6Check }) {
  return (
    <Flex
      align="center"
      justify="between"
      flexGrow="1"
      overflow="hidden"
      px="3"
      py="2"
      css={css`
        cursor: var(--cursor-button);

        &:not(:last-child) {
          border-bottom: 1px solid var(--gray-3);
        }
      `}
    >
      {hasFailures(check) && (
        <Cross2Icon width="24px" height="24px" color="#ff8a88" />
      )}
      {!hasFailures(check) && (
        <CheckIcon width="24px" height="24px" color="#3dd68c" />
      )}
      <Box flexGrow="1" asChild ml="4">
        <Text
          truncate
          css={css`
            font-size: 13px;
            line-height: 24px;
          `}
        >
          {check.name}
        </Text>
      </Box>
      <Flex justify="end" asChild>
        {hasFailures(check) && (
          <Tooltip
            content={`${getPassPercentage(check).toFixed(2)}% success rate`}
          >
            <Text
              truncate
              css={css`
                font-size: 13px;
                line-height: 24px;
              `}
            >
              Passed: {check.passes} | Failed: {check.fails}
            </Text>
          </Tooltip>
        )}
      </Flex>
    </Flex>
  )
}
