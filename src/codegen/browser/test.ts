import { BrowserEvent } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'

import { TestNode, PageNode, NodeRef, Test, LocatorNode } from './types'

interface Recording {
  browserEvents: BrowserEvent[]
}

function toNodeRef(node: TestNode): NodeRef {
  return {
    nodeId: node.nodeId,
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

  function getLocator(tab: string, selector: string): NodeRef {
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
      previousLocator?.selector !== selector ||
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
      case 'navigated-to-page':
        return {
          type: 'goto',
          nodeId: event.eventId,
          url: event.url,
          inputs: {
            previous,
            page: getPage(event.tab),
          },
        }

      case 'reloaded-page':
        return {
          type: 'reload',
          nodeId: event.eventId,
          inputs: {
            previous,
            page: getPage(event.tab),
          },
        }

      case 'clicked': {
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

      case 'input-changed':
        return {
          type: 'type-text',
          nodeId: event.eventId,
          value: event.value,
          inputs: {
            previous,
            locator: getLocator(event.tab, event.selector),
          },
        }

      case 'check-changed':
        return {
          type: 'check',
          nodeId: event.eventId,
          checked: event.checked,
          inputs: {
            previous,
            locator: getLocator(event.tab, event.selector),
          },
        }

      case 'radio-changed':
        return {
          type: 'check',
          nodeId: event.eventId,
          checked: true,
          inputs: {
            previous,
            locator: getLocator(event.tab, event.selector),
          },
        }

      case 'select-changed':
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

      case 'form-submitted':
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

      case 'asserted-text':
        return {
          type: 'assert',
          nodeId: event.eventId,
          operation: {
            type: 'text-contains',
            value: event.operation.value,
          },
          inputs: {
            previous,
            locator: getLocator(event.tab, event.selector),
          },
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
