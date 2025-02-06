import { BrowserEvent } from '@/schemas/recording'
import { TestNode, PageNode, NodeRef, Test, LocatorNode } from './types'
import { exhaustive } from '@/utils/typescript'

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
      case 'page-navigation':
        if (event.source === 'interaction' || event.source === 'script') {
          return null
        }

        return {
          type: 'goto',
          nodeId: event.eventId,
          url: event.url,
          inputs: {
            previous,
            page: getPage(event.tab),
          },
        }

      case 'page-reload':
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
