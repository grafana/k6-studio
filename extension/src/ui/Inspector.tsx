import { css } from '@emotion/react'
import { useEffect, useState } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { useContainerElement } from './ContainerProvider'
import { generateSelector } from '../selectors'
import { useKey } from 'react-use'
import { ElementHighlight } from './ElementHighlight'

interface Bounds {
  top: number
  left: number
  width: number
  height: number
}

interface TrackedElement {
  selector: string
  target: Element
  bounds: Bounds
}

function useElementTracking() {
  const [element, setTrackedElement] = useState<TrackedElement | null>(null)

  useEffect(() => {
    const handleMouseOver = (ev: MouseEvent) => {
      const [target] = ev.composedPath()

      if (target instanceof Element === false) {
        return
      }

      const root = target.getRootNode()

      if (root instanceof ShadowRoot) {
        if (target.hasAttribute('data-inspector-tooltip')) {
          return
        }

        setTrackedElement(null)

        return
      }

      const { top, left, width, height } = target.getBoundingClientRect()

      setTrackedElement({
        selector: generateSelector(target),
        target: target,
        bounds: {
          top,
          left,
          width,
          height,
        },
      })
    }

    window.addEventListener('mouseover', handleMouseOver)

    return () => {
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [])

  useEffect(() => {
    if (element === null) {
      return
    }

    const captureClick = (ev: MouseEvent) => {
      ev.preventDefault()
      ev.stopPropagation()
    }

    window.addEventListener('click', captureClick, { capture: true })

    return () => {
      window.removeEventListener('click', captureClick, { capture: true })
    }
  }, [element])

  return element
}

interface InspectorProps {
  onEscape: () => void
}

export function Inspector({ onEscape }: InspectorProps) {
  const element = useElementTracking()
  const container = useContainerElement()

  useKey('Escape', onEscape, {}, [onEscape])

  useEffect(() => {
    document.body.classList.add('ksix-studio-inspecting')

    return () => {
      document.body.classList.remove('ksix-studio-inspecting')
    }
  }, [])

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
