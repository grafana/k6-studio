import { css } from '@emotion/react'
import { useEffect } from 'react'

import { Tooltip } from '@/components/primitives/Tooltip'

import { client } from '../routing'

import { useInspectedElement } from './ElementInspector.hooks'
import { Overlay } from './Overlay'
import { useEscape } from './hooks/useEscape'

interface ElementInspectorProps {
  onCancel: () => void
}

export function ElementInspector({ onCancel }: ElementInspectorProps) {
  const element = useInspectedElement()

  useEscape(onCancel, [onCancel])

  useEffect(() => {
    client.send({
      type: 'highlight-elements',
      selector: element && {
        type: 'css',
        selector: element.selector.css,
      },
    })
  }, [element])

  if (element === null) {
    return null
  }

  return (
    <Tooltip.Root open={true}>
      <Tooltip.Trigger asChild>
        <Overlay bounds={element.bounds} />
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          data-inspector-tooltip
          css={css`
            font-weight: 500;
          `}
        >
          <Tooltip.Arrow />
          <strong>{element.selector.css}</strong>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
