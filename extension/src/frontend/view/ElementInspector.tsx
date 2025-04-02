import { css } from '@emotion/react'

import { Tooltip } from '@/components/primitives/Tooltip'

import { ElementHighlight } from './ElementHighlight'
import { useInspectedElement } from './ElementInspector.hooks'
import { useEscape } from './hooks/useEscape'

interface ElementInspectorProps {
  onCancel: () => void
}

export function ElementInspector({ onCancel }: ElementInspectorProps) {
  const element = useInspectedElement()

  useEscape(onCancel, [onCancel])

  if (element === null) {
    return null
  }

  return (
    <Tooltip.Root open={true}>
      <Tooltip.Trigger asChild>
        <ElementHighlight bounds={element.bounds} />
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          data-inspector-tooltip
          css={css`
            font-weight: 500;
          `}
        >
          <Tooltip.Arrow />
          <strong>{element.selector}</strong>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
