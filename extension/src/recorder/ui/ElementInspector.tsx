import { useKey } from 'react-use'
import { ElementHighlight } from './ElementHighlight'
import { useInspectedElement } from './ElementInspector.hooks'
import { Tooltip } from '@/components/primitives/Tooltip'
import { css } from '@emotion/react'

interface ElementInspectorProps {
  onEscape: () => void
}

export function ElementInspector({ onEscape }: ElementInspectorProps) {
  const element = useInspectedElement()

  useKey('Escape', onEscape, {}, [onEscape])

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
