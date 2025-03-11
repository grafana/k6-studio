import { css } from '@emotion/react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { useContainerElement } from './ContainerProvider'
import { useKey } from 'react-use'
import { ElementHighlight } from './ElementHighlight'
import { useInspectedElement } from './ElementInspector.hooks'

interface ElementInspectorProps {
  onEscape: () => void
}

export function ElementInspector({ onEscape }: ElementInspectorProps) {
  const element = useInspectedElement()
  const container = useContainerElement()

  useKey('Escape', onEscape, {}, [onEscape])

  if (element === null) {
    return null
  }

  return (
    <>
      <Tooltip.Provider>
        <Tooltip.Root open={true}>
          <Tooltip.Trigger asChild>
            <ElementHighlight bounds={element.bounds} />
          </Tooltip.Trigger>
          <Tooltip.Portal container={container}>
            <Tooltip.Content
              data-inspector-tooltip
              css={css`
                padding: 8px;
                background-color: white;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
                font-weight: 500;
                z-index: 9999999999;
              `}
            >
              <Tooltip.Arrow
                css={css`
                  fill: white;
                `}
              />
              {element.selector}
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    </>
  )
}
