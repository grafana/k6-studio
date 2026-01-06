import { NodeSelector } from '@/codegen/browser/selectors'
import { Locator } from '@/components/Browser/Locator'
import { ActionLocator } from '@/main/runner/schema'
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
}

export function BrowserActionLocator({ locator }: BrowserActionLocatorProps) {
  const nodeLocator = toNodeSelector(locator)

  return <Locator locator={nodeLocator} />
}
