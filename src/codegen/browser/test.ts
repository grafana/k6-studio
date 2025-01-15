import { BrowserEvent } from '@/schemas/recording'
import { TestNode, PageNode, NodeRef, Test } from './types'
import { exhaustive } from '@/utils/typescript'

interface Recording {
  browserEvents: BrowserEvent[]
}

function buildBrowserNodeGraph(events: BrowserEvent[]) {
  const pages = new Map<string, PageNode>()
  const nodes: TestNode[] = []

  function getPage(pageId: string): NodeRef {
    let page = pages.get(pageId)

    if (page === undefined) {
      page = {
        type: 'page',
        nodeId: pageId,
        ports: {},
      }

      nodes.push(page)
      pages.set(pageId, page)
    }

    return {
      nodeId: page.nodeId,
    }
  }

  function toNode(event: BrowserEvent): TestNode {
    switch (event.type) {
      case 'page-navigation':
        return {
          type: 'goto',
          nodeId: event.eventId,
          url: event.url,
          ports: {
            previous,
            page: getPage(event.tab),
          },
        }

      case 'page-reload':
        return {
          type: 'reload',
          nodeId: event.eventId,
          ports: {
            previous,
            page: getPage(event.tab),
          },
        }

      default:
        return exhaustive(event)
    }
  }

  let previous: TestNode | undefined = undefined

  for (const event of events) {
    const node = toNode(event)

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
