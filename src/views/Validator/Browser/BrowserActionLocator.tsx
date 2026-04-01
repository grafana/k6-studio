import { Locator } from '@/components/Browser/Locator'
import { ActionLocator } from '@/main/runner/schema'
import { NodeSelector } from '@/schemas/selectors'
import { exhaustive } from '@/utils/typescript'

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

interface BrowserActionLocatorProps {
  locator: ActionLocator
  onHighlight?: (selector: NodeSelector | null) => void
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

    onHighlight(nodeLocator)
  }

  return (
    <Locator
      locator={nodeLocator}
      onHighlightChange={onHighlight ? handleHighlightChange : undefined}
    />
  )
}
