import { Locator } from '@/components/Browser/Locator'
import { ActionLocator } from '@/main/runner/schema'
import { NodeSelector } from '@/schemas/selectors'
import { exhaustive } from '@/utils/typescript'
import { HighlightSelector } from 'extension/src/messaging/types'

function toNodeSelector(locator: ActionLocator): NodeSelector {
  switch (locator.type) {
    case 'css':
      return {
        type: 'css',
        selector: locator.selector,
      }

    case 'testid':
      return {
        type: 'test-id',
        testId: locator.testId,
      }

    case 'role':
      return {
        type: 'role',
        role: locator.role,
        name: locator.options?.name ?? '',
      }

    case 'alt':
      return {
        type: 'alt',
        text: locator.text,
      }

    case 'label':
      return {
        type: 'label',
        text: locator.label,
      }

    case 'placeholder':
      return {
        type: 'placeholder',
        text: locator.placeholder,
      }

    case 'text':
      return {
        type: 'text',
        text: locator.text,
      }

    case 'title':
      return {
        type: 'title',
        text: locator.title,
      }

    default:
      return exhaustive(locator)
  }
}

function toCssSelector(locator: ActionLocator): string | null {
  switch (locator.type) {
    case 'css':
      return locator.selector

    case 'testid':
      return `[data-testid="${locator.testId}"]`

    case 'role':
      return null

    case 'alt':
      return `[alt="${locator.text}"]`

    case 'label':
      return null

    case 'placeholder':
      return `[placeholder="${locator.placeholder}"]`

    case 'text':
      return null

    case 'title':
      return `[title="${locator.title}"]`

    default:
      return exhaustive(locator)
  }
}

interface BrowserActionLocatorProps {
  locator: ActionLocator
  onHighlight?: (selector: HighlightSelector | null) => void
}

export function BrowserActionLocator({
  locator,
  onHighlight,
}: BrowserActionLocatorProps) {
  const nodeLocator = toNodeSelector(locator)

  const handleHighlightChange = (highlighted: boolean) => {
    if (!highlighted || !onHighlight) {
      onHighlight?.(null)
      return
    }

    const cssSelector = toCssSelector(locator)

    if (cssSelector === null) {
      return
    }

    onHighlight({
      type: 'css',
      selector: cssSelector,
    })
  }

  return (
    <Locator
      locator={nodeLocator}
      onHighlightChange={onHighlight ? handleHighlightChange : undefined}
    />
  )
}
