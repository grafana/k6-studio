import { css } from '@emotion/react'
import { Flex, Text, TextField, Tooltip } from '@radix-ui/themes'
import { InfoIcon } from 'lucide-react'

interface PostTestTimeoutControlProps {
  timeout: number
  onChange: (timeout: number) => void
}

export function PostTestTimeoutControl({
  timeout,
  onChange,
}: PostTestTimeoutControlProps) {
  return (
    <Flex align="center" gap="2">
      <Text size="1" weight="medium">
        Browser shutdown delay
      </Text>
      <TextField.Root
        size="1"
        type="number"
        min={0}
        value={isNaN(timeout) ? '' : timeout}
        onChange={(e) => {
          const trimmed = e.target.value.trim()

          if (!trimmed) {
            onChange(NaN)
            return
          }

          onChange(Number(trimmed))
        }}
        css={css`
          width: 80px;
        `}
      >
        <TextField.Slot side="right">
          <Text size="1" color="gray">
            ms
          </Text>
        </TextField.Slot>
      </TextField.Root>
      <Tooltip
        content={
          <>
            <p>
              The amount of time to wait after the last browser action before
              closing the browser. Ensures the browser has enough time to render
              content for the preview.
            </p>
            <p>This timeout will not be part of the generated script.</p>
          </>
        }
        maxWidth="260px"
      >
        <InfoIcon
          size={14}
          css={css`
            color: var(--gray-a9);
            flex-shrink: 0;
            cursor: default;
          `}
        />
      </Tooltip>
    </Flex>
  )
}
