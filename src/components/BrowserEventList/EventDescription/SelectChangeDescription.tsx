import { css } from '@emotion/react'

import { formatOption, SelectOptions } from '@/components/Browser/SelectOptions'
import { Tooltip } from '@/components/primitives/Tooltip'
import { ActionLocator } from '@/main/runner/schema'
import { SelectChangeEvent } from '@/schemas/recording'

import { Selector } from './Selector'

interface SelectChangeDescriptionProps {
  event: SelectChangeEvent
  onHighlight: (selector: ActionLocator | null) => void
}

export function SelectChangeDescription({
  event,
  onHighlight,
}: SelectChangeDescriptionProps) {
  return (
    <>
      Selected
      <Tooltip
        content={event.selected
          .map((option) => formatOption(option))
          .join(', ')}
      >
        <div
          css={css`
            gap: calc(var(--studio-spacing-1) * 1.5);
            flex-shrink: 1;
            padding: calc(var(--studio-spacing-1) * 0.5)
              calc(var(--studio-spacing-1) * 1.5);
            overflow: hidden;
            background-color: var(--gray-3);
            color: var(--gray-12);
            border-radius: 3px;
            font-size: var(--studio-font-size-1);
          `}
        >
          <SelectOptions options={event.selected} />
        </div>
      </Tooltip>{' '}
      from{' '}
      <Selector selectors={event.target.selectors} onHighlight={onHighlight} />
    </>
  )
}
