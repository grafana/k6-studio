import {
  Assertion,
  BrowserEvent,
  BrowserEventTarget,
} from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'

import { isSelectorEqual, getNodeSelector } from './selectors'
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

  function getLocator(tab: string, target: BrowserEventTarget): NodeRef {
    const page = getPage(tab)

    // Group sequential locators together, so that we reuse the same locator
    // multiple actions have occurred on the same element, e.g:
    // ```
    // const input = page.locator("input")
    //
    // await input.focus()
    // await input.type("Hello")
    // await input.press("Enter")

    const selector = getNodeSelector(target.selectors)

    if (
      previousLocator === null ||
      !isSelectorEqual(selector, previousLocator.selector) ||
      previousLocator.inputs.page.nodeId !== page.nodeId
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

  function toNode(
    event: BrowserEvent,
    nextEvent?: BrowserEvent
  ): TestNode | null {
    switch (event.type) {
      case 'navigate-to-page':
        return {
          type: 'goto',
          nodeId: event.eventId,
          url: event.url,
          source: event.source,
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
        const triggersNavigation =
          nextEvent?.type === 'navigate-to-page' &&
          nextEvent.source === 'implicit'

        return {
          type: 'click',
          nodeId: event.eventId,
          button: event.button,
          modifiers: event.modifiers,
          triggersNavigation,
          inputs: {
            previous,
            locator: getLocator(event.tab, event.target),
            page: getPage(event.tab),
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
            locator: getLocator(event.tab, event.target),
          },
        }

      case 'check-change':
        return {
          type: 'check',
          nodeId: event.eventId,
          checked: event.checked,
          inputs: {
            previous,
            locator: getLocator(event.tab, event.target),
          },
        }

      case 'radio-change':
        return {
          type: 'check',
          nodeId: event.eventId,
          checked: true,
          inputs: {
            previous,
            locator: getLocator(event.tab, event.target),
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
            locator: getLocator(event.tab, event.target),
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
            locator: getLocator(event.tab, event.target),
          },
        }
      }

      default:
        return exhaustive(event)
    }
  }

  let previous: TestNode | undefined = undefined

  for (const [index, event] of events.entries()) {
    const nextEvent = events[index + 1]
    const node = toNode(event, nextEvent)

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
