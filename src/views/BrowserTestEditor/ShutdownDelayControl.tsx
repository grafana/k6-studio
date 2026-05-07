import { css } from '@emotion/react'
import * as Label from '@radix-ui/react-label'
import { Flex, Text, TextField, Tooltip } from '@radix-ui/themes'
import { InfoIcon } from 'lucide-react'
import { useId } from 'react'

interface ShutdownDelayControlProps {
  timeout: number
  onChange: (timeout: number) => void
}

export function ShutdownDelayControl({
  timeout,
  onChange,
}: ShutdownDelayControlProps) {
  const id = useId()

  return (
    <Flex align="center" gap="2">
      <Text asChild size="1">
        <Label.Root htmlFor={id}>Browser shutdown delay</Label.Root>
      </Text>
      <TextField.Root
        id={id}
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
            Ensures the browser has enough time to render content for the
            preview. This timeout will not be part of the generated script.
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
