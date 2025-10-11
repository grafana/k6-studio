import { Assertion, BrowserEvent, ElementSelector } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'

import {
  TestNode,
  PageNode,
  NodeRef,
  Test,
  LocatorNode,
  AssertionOperation,
} from './types'

interface Recording {
  browserEvents: BrowserEvent[]
}

function toNodeRef(node: TestNode): NodeRef {
  return {
    nodeId: node.nodeId,
  }
}

function toAssertionOperation(assertion: Assertion): AssertionOperation {
  switch (assertion.type) {
    case 'text':
      return {
        type: 'text-contains',
        value: assertion.operation.value,
      }

    case 'visibility':
      return {
        type: 'is-visible',
        visible: assertion.visible,
      }

    case 'check':
      return {
        type: 'is-checked',
        inputType: assertion.inputType,
        expected: assertion.expected,
      }

    case 'text-input':
      return {
        type: 'has-values',
        expected: [assertion.expected],
      }

    default:
      return exhaustive(assertion)
  }
}

function buildBrowserNodeGraph(events: BrowserEvent[]) {
  const pages = new Map<string, PageNode>()

  let previousLocator: LocatorNode | null = null

  const nodes: TestNode[] = []

  function getPage(pageId: string): NodeRef {
    let page = pages.get(pageId)

    if (page === undefined) {
      page = {
        type: 'page',
        nodeId: pageId,
      }

      nodes.push(page)
      pages.set(pageId, page)
    }

    return toNodeRef(page)
  }

  function getLocator(tab: string, selector: ElementSelector): NodeRef {
    const page = getPage(tab)

    // Group sequential locators together, so that we reuse the same locator
    // multiple actions have occurred on the same element, e.g:
    // ```
    // const input = page.locator("input")
    //
    // await input.focus()
    // await input.type("Hello")
    // await input.press("Enter")

    if (
      previousLocator?.selector.css !== selector.css ||
      previousLocator?.inputs.page.nodeId !== page.nodeId
    ) {
      previousLocator = {
        type: 'locator',
        nodeId: crypto.randomUUID(),
        selector,
        inputs: {
          page,
        },
      }

      nodes.push(previousLocator)
    }

    return toNodeRef(previousLocator)
  }

  function toNode(event: BrowserEvent): TestNode | null {
    switch (event.type) {
      case 'navigate-to-page':
        return {
          type: 'goto',
          nodeId: event.eventId,
          url: event.url,
          inputs: {
            previous,
            page: getPage(event.tab),
          },
        }

      case 'reload-page':
        return {
          type: 'reload',
          nodeId: event.eventId,
          inputs: {
            previous,
            page: getPage(event.tab),
          },
        }

      case 'click': {
        return {
          type: 'click',
          nodeId: event.eventId,
          button: event.button,
          modifiers: event.modifiers,
          inputs: {
            previous,
            locator: getLocator(event.tab, event.selector),
          },
        }
      }

      case 'input-change':
        return {
          type: 'type-text',
          nodeId: event.eventId,
          value: event.value,
          inputs: {
            previous,
            locator: getLocator(event.tab, event.selector),
          },
        }

      case 'check-change':
        return {
          type: 'check',
          nodeId: event.eventId,
          checked: event.checked,
          inputs: {
            previous,
            locator: getLocator(event.tab, event.selector),
          },
        }

      case 'radio-change':
        return {
          type: 'check',
          nodeId: event.eventId,
          checked: true,
          inputs: {
            previous,
            locator: getLocator(event.tab, event.selector),
          },
        }

      case 'select-change':
        return {
          type: 'select-options',
          nodeId: event.eventId,
          selected: event.selected,
          multiple: event.multiple,
          inputs: {
            previous,
            locator: getLocator(event.tab, event.selector),
          },
        }

      case 'submit-form':
        return {
          type: 'click',
          nodeId: event.eventId,
          button: 'left',
          modifiers: {
            ctrl: false,
            shift: false,
            alt: false,
            meta: false,
          },
          inputs: {
            previous,
            locator: getLocator(event.tab, event.submitter),
          },
        }

      case 'grant-permissions':
        return {
          type: 'grant-permissions',
          nodeId: event.eventId,
          permissions: event.permissions,
          origin: event.origin,
          inputs: {
            previous,
            page: getPage(event.tab),
          },
        }

      case 'assert': {
        return {
          type: 'assert',
          nodeId: event.eventId,
          operation: toAssertionOperation(event.assertion),
          inputs: {
            previous,
            locator: getLocator(event.tab, event.selector),
          },
        }
      }

      default:
        return exhaustive(event)
    }
  }

  let previous: TestNode | undefined = undefined

  for (const event of events) {
    const node = toNode(event)

    if (node === null) {
      continue
    }

    nodes.push(node)

    previous = node
  }

  return nodes
}

export function convertToTest({ browserEvents }: Recording): Test {
  return {
    defaultScenario: {
      nodes: buildBrowserNodeGraph(browserEvents),
    },
    scenarios: {},
  }
}
