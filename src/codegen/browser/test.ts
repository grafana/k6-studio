import { BrowserEvent } from '@/schemas/recording'
import { TestNode, PageNode, NodeRef, Test, LocatorNode } from './types'
import { exhaustive } from '@/utils/typescript'

interface Recording {
  browserEvents: BrowserEvent[]
}

function buildBrowserNodeGraph(events: BrowserEvent[]) {
  const pages = new Map<string, PageNode>()
  const locators = new Map<string, LocatorNode>()

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

    return {
      nodeId: page.nodeId,
    }
  }

  function getLocator(tab: string, selector: string): NodeRef {
    const page = getPage(tab)

    let locator = locators.get(selector)

    if (locator === undefined) {
      locator = {
        type: 'locator',
        nodeId: `${tab}::${selector}`,
        selector,
        inputs: {
          page,
        },
      }

      nodes.push(locator)
      locators.set(selector, locator)
    }

    return locator
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

      case 'click':
        return {
          type: 'click',
          nodeId: event.eventId,
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
