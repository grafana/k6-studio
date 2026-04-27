import { keyBy } from 'lodash-es'

import {
  Assertion,
  BrowserEvent,
  BrowserEventTarget,
} from '@/schemas/recording'
import { toClickButton, toClickModifiers } from '@/utils/clickOptions'
import { exhaustive } from '@/utils/typescript'
import {
  BrowserActionInstance,
  LocatorOptions,
} from '@/views/BrowserTestEditor/types'

import { isSelectorEqual, getNodeSelector, toNodeSelector } from './selectors'
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

function buildBrowserNodeGraphFromEvents(events: BrowserEvent[]) {
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

  function getWaitForNavigation(
    currentEvent: BrowserEvent,
    nextEvent?: BrowserEvent
  ): { page: NodeRef } | undefined {
    if (
      nextEvent === undefined ||
      nextEvent.type !== 'navigate-to-page' ||
      nextEvent.source !== 'implicit' ||
      nextEvent.tab !== currentEvent.tab
    ) {
      return undefined
    }

    return { page: getPage(nextEvent.tab) }
  }

  function toNode(
    event: BrowserEvent,
    nextEvent?: BrowserEvent
  ): TestNode | null {
    switch (event.type) {
      case 'navigate-to-page':
        if (event.source === 'implicit') {
          return null
        }

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
        return {
          type: 'click',
          nodeId: event.eventId,
          button: event.button,
          modifiers: event.modifiers,
          waitForNavigation: getWaitForNavigation(event, nextEvent),
          inputs: {
            previous,
            locator: getLocator(event.tab, event.target),
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

      case 'submit-form': {
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
          waitForNavigation: getWaitForNavigation(event, nextEvent),
          inputs: {
            previous,
            locator: getLocator(event.tab, event.submitter),
          },
        }
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

      case 'wait-for': {
        return {
          type: 'wait-for',
          nodeId: event.eventId,
          inputs: {
            previous,
            locator: getLocator(event.tab, event.target),
          },
          options: event.options,
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

function buildBrowserNodeGraphFromActions(
  browserActions: BrowserActionInstance[]
) {
  const nodes: TestNode[] = []
  let previousLocatorNode: LocatorNode | null = null

  let currentPage: PageNode | undefined = undefined

  // We create the page lazily so that we don't emit a page node if
  // the test is empty.
  function getPage(): NodeRef {
    if (currentPage === undefined) {
      currentPage = {
        type: 'page',
        nodeId: crypto.randomUUID(),
      }

      nodes.push(currentPage)
    }

    return toNodeRef(currentPage)
  }

  function getLocator({ current, values }: LocatorOptions): NodeRef {
    const currentLocator = values[current]
    if (!currentLocator) {
      throw new Error(
        `Current locator of type "${current}" not found in locator values.`
      )
    }

    // Group sequential locators together, so that we reuse the same locator
    // multiple actions have occurred on the same element, e.g:
    // ```
    // const input = page.locator("input")
    //
    // await input.focus()
    // await input.type("Hello")
    // await input.press("Enter")

    const selector = toNodeSelector(currentLocator)

    if (
      previousLocatorNode === null ||
      !isSelectorEqual(selector, previousLocatorNode.selector) ||
      previousLocatorNode.inputs.page.nodeId !== getPage().nodeId
    ) {
      previousLocatorNode = {
        type: 'locator',
        nodeId: crypto.randomUUID(),
        selector,
        inputs: {
          page: getPage(),
        },
      }

      nodes.push(previousLocatorNode)
    }

    return toNodeRef(previousLocatorNode)
  }

  function toNode(action: BrowserActionInstance): TestNode {
    switch (action.method) {
      case 'page.goto':
        return {
          type: 'goto',
          nodeId: crypto.randomUUID(),
          url: action.url,
          source: 'address-bar',
          inputs: {
            page: getPage(),
          },
        }
      case 'page.reload':
        return {
          type: 'reload',
          nodeId: crypto.randomUUID(),
          inputs: {
            page: getPage(),
          },
        }
      case 'locator.waitFor':
        return {
          type: 'wait-for',
          nodeId: crypto.randomUUID(),
          inputs: {
            locator: getLocator(action.locator),
          },
          options: action.options,
        }
      case 'locator.click':
        return {
          type: 'click',
          nodeId: crypto.randomUUID(),
          button: toClickButton(action.options),
          modifiers: toClickModifiers(action.options?.modifiers),
          waitForNavigation: action.options?.waitForNavigation
            ? { page: getPage() }
            : undefined,
          inputs: {
            locator: getLocator(action.locator),
          },
        }
      case 'locator.check':
        return {
          type: 'check',
          nodeId: crypto.randomUUID(),
          checked: true,
          inputs: {
            locator: getLocator(action.locator),
          },
        }
      case 'locator.uncheck':
        return {
          type: 'check',
          nodeId: crypto.randomUUID(),
          checked: false,
          inputs: {
            locator: getLocator(action.locator),
          },
        }
      case 'locator.fill':
        return {
          type: 'type-text',
          nodeId: crypto.randomUUID(),
          value: action.value,
          inputs: {
            locator: getLocator(action.locator),
          },
        }
      case 'locator.clear':
        return {
          type: 'clear',
          nodeId: crypto.randomUUID(),
          inputs: {
            locator: getLocator(action.locator),
          },
        }
      case 'locator.selectOption': {
        const deduped = Object.values(
          keyBy(action.values, (v) => {
            if (v.value !== undefined) return `value:${v.value}`
            if (v.label !== undefined) return `label:${v.label}`
            return `index:${v.index}`
          })
        )
        const selected = deduped.length > 0 ? deduped : ['']

        return {
          type: 'select-options',
          nodeId: crypto.randomUUID(),
          selected,
          multiple: selected.length > 1,
          inputs: {
            locator: getLocator(action.locator),
          },
        }
      }
      case 'page.waitForTimeout':
        return {
          type: 'wait-for-timeout',
          nodeId: crypto.randomUUID(),
          timeout: action.timeout,
          inputs: {
            page: getPage(),
          },
        }
      case 'page.waitForNavigation':
      case 'page.close':
      case 'page.*':
      case 'locator.dblclick':
      case 'locator.type':
      case 'locator.hover':
      case 'locator.setChecked':
      case 'locator.tap':
      case 'locator.press':
      case 'locator.focus':
      case 'locator.*':
      case 'browserContext.*':
        throw new Error('Not implemented.')
      default:
        return exhaustive(action)
    }
  }

  browserActions.forEach((action) => {
    const node = toNode(action)

    nodes.push(node)
  })

  return nodes
}

export function convertEventsToTest({ browserEvents }: Recording): Test {
  return {
    defaultScenario: {
      nodes: buildBrowserNodeGraphFromEvents(browserEvents),
    },
    scenarios: {},
  }
}

export function convertActionsToTest({
  browserActions,
}: {
  browserActions: BrowserActionInstance[]
}): Test {
  return {
    defaultScenario: {
      nodes: buildBrowserNodeGraphFromActions(browserActions),
    },
    scenarios: {},
  }
}
