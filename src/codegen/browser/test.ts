import { keyBy } from 'lodash-es'

import { AnyBrowserAction, BrowserTestOptions } from '@/schemas/browserTest'
import { ElementLocator, LocatorOptions } from '@/schemas/locator'
import {
  Assertion,
  BrowserEvent,
  BrowserEventTarget,
} from '@/schemas/recording'
import { isWebUrl } from '@/utils/browserEvents'
import { toClickButton, toClickModifiers } from '@/utils/clickOptions'
import { getElementLocator, isLocatorEqual } from '@/utils/locator'
import { exhaustive } from '@/utils/typescript'

import { isFollowedByImplicitNavigation } from './navigation'
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

function toNonEmptyStrings(values: string[]): [string, ...string[]] {
  const [first, ...rest] = values
  return [first ?? '', ...rest]
}

function toElementLocator({ current, values }: LocatorOptions): ElementLocator {
  const locator = values[current]

  if (!locator) {
    throw new Error(
      `Current locator of type "${current}" not found in locator values.`
    )
  }

  return locator
}

function framesEqual(
  a: ElementLocator[] | undefined,
  b: ElementLocator[] | undefined
): boolean {
  if (a === undefined && b === undefined) {
    return true
  }

  if (a === undefined || b === undefined || a.length !== b.length) {
    return false
  }

  return a.every((frame, index) => {
    const other = b[index]

    return other !== undefined && isLocatorEqual(frame, other)
  })
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
        type: 'has-value',
        expected: assertion.expected,
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

  function getLocator(
    tab: string,
    target: BrowserEventTarget,
    frame?: BrowserEventTarget[]
  ): NodeRef {
    const page = getPage(tab)

    // Group sequential locators together, so that we reuse the same locator
    // multiple actions have occurred on the same element, e.g:
    // ```
    // const input = page.locator("input")
    //
    // await input.focus()
    // await input.type("Hello")
    // await input.press("Enter")

    const locator = getElementLocator(target.selectors)
    const frames = frame?.map((entry) => getElementLocator(entry.selectors))

    if (
      previousLocator === null ||
      !isLocatorEqual(locator, previousLocator.locator) ||
      !framesEqual(frames, previousLocator.frames) ||
      previousLocator.inputs.page.nodeId !== page.nodeId
    ) {
      previousLocator = {
        type: 'locator',
        nodeId: crypto.randomUUID(),
        locator,
        frames,
        inputs: {
          page,
        },
      }

      nodes.push(previousLocator)
    }

    return toNodeRef(previousLocator)
  }

  function getExpect(
    tab: string,
    target: BrowserEventTarget,
    frame: BrowserEventTarget[] | undefined,
    eventId: string
  ): NodeRef {
    const locator = getLocator(tab, target, frame)

    const expectNode: TestNode = {
      type: 'expect',
      nodeId: `${eventId}-expect`,
      inputs: { locator },
    }

    nodes.push(expectNode)

    return toNodeRef(expectNode)
  }

  function getWaitForNavigation(
    currentEvent: BrowserEvent,
    nextEvent?: BrowserEvent
  ): { page: NodeRef } | undefined {
    if (
      nextEvent === undefined ||
      !isFollowedByImplicitNavigation(currentEvent, nextEvent)
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
      case 'tab-opened':
        return null

      case 'navigate-to-page':
        if (event.source === 'implicit' || !isWebUrl(event.url)) {
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
        if (!isWebUrl(event.url)) {
          return null
        }

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
            locator: getLocator(event.tab, event.target, event.frames),
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
            locator: getLocator(event.tab, event.target, event.frames),
          },
        }

      case 'check-change':
        return {
          type: 'check',
          nodeId: event.eventId,
          checked: event.checked,
          inputs: {
            previous,
            locator: getLocator(event.tab, event.target, event.frames),
          },
        }

      case 'radio-change':
        return {
          type: 'check',
          nodeId: event.eventId,
          checked: true,
          inputs: {
            previous,
            locator: getLocator(event.tab, event.target, event.frames),
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
            locator: getLocator(event.tab, event.target, event.frames),
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
            locator: getLocator(event.tab, event.submitter, event.frames),
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
            expect: getExpect(
              event.tab,
              event.target,
              event.frames,
              event.eventId
            ),
          },
        }
      }

      case 'wait-for': {
        return {
          type: 'wait-for',
          nodeId: event.eventId,
          inputs: {
            previous,
            locator: getLocator(event.tab, event.target, event.frames),
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
  browserActions: AnyBrowserAction[],
  trace = false
) {
  const nodes: TestNode[] = []
  let previousLocatorNode: LocatorNode | null = null

  let currentPage: PageNode | undefined = undefined

  function withTrace(action: AnyBrowserAction, nodeRef: NodeRef) {
    if (!trace) {
      return nodeRef
    }

    const traceNode: TestNode = {
      type: 'trace',
      nodeId: crypto.randomUUID(),
      traceId: action.id,
      inputs: {
        previous: nodeRef,
      },
    }

    nodes.push(traceNode)

    return toNodeRef(traceNode)
  }

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

  function getLocator(
    locatorOptions: LocatorOptions,
    frameOptions?: LocatorOptions[]
  ): NodeRef {
    const currentLocator = toElementLocator(locatorOptions)
    const frames = frameOptions?.map(toElementLocator)

    // Group sequential locators together, so that we reuse the same locator
    // multiple actions have occurred on the same element, e.g:
    // ```
    // const input = page.locator("input")
    //
    // await input.focus()
    // await input.type("Hello")
    // await input.press("Enter")

    if (
      previousLocatorNode === null ||
      !isLocatorEqual(currentLocator, previousLocatorNode.locator) ||
      !framesEqual(frames, previousLocatorNode.frames) ||
      previousLocatorNode.inputs.page.nodeId !== getPage().nodeId
    ) {
      previousLocatorNode = {
        type: 'locator',
        nodeId: crypto.randomUUID(),
        locator: currentLocator,
        frames,
        inputs: {
          page: getPage(),
        },
      }

      nodes.push(previousLocatorNode)
    }

    return toNodeRef(previousLocatorNode)
  }

  function getExpectNode(
    locatorRef: NodeRef,
    action: AnyBrowserAction
  ): NodeRef {
    const expectNode: TestNode = {
      type: 'expect',
      nodeId: crypto.randomUUID(),
      inputs: { locator: locatorRef },
    }

    nodes.push(expectNode)

    return withTrace(action, toNodeRef(expectNode))
  }

  function toNode(action: AnyBrowserAction): TestNode {
    switch (action.method) {
      case 'page.goto':
        return {
          type: 'goto',
          nodeId: crypto.randomUUID(),
          url: action.url,
          source: 'address-bar',
          inputs: {
            page: withTrace(action, getPage()),
          },
        }
      case 'page.reload':
        return {
          type: 'reload',
          nodeId: crypto.randomUUID(),
          inputs: {
            page: withTrace(action, getPage()),
          },
        }
      case 'locator.waitFor':
        return {
          type: 'wait-for',
          nodeId: crypto.randomUUID(),
          inputs: {
            locator: withTrace(
              action,
              getLocator(action.locator, action.frames)
            ),
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
            locator: withTrace(
              action,
              getLocator(action.locator, action.frames)
            ),
          },
        }
      case 'locator.check':
        return {
          type: 'check',
          nodeId: crypto.randomUUID(),
          checked: true,
          inputs: {
            locator: withTrace(
              action,
              getLocator(action.locator, action.frames)
            ),
          },
        }
      case 'locator.uncheck':
        return {
          type: 'check',
          nodeId: crypto.randomUUID(),
          checked: false,
          inputs: {
            locator: withTrace(
              action,
              getLocator(action.locator, action.frames)
            ),
          },
        }
      case 'locator.toBeChecked':
        return {
          type: 'assert',
          nodeId: crypto.randomUUID(),
          operation: {
            type: 'is-checked',
            inputType: action.inputType,
            expected: action.checked ? 'checked' : 'unchecked',
          },
          inputs: {
            expect: getExpectNode(
              getLocator(action.locator, action.frames),
              action
            ),
          },
        }
      case 'locator.toBeVisible':
        return {
          type: 'assert',
          nodeId: crypto.randomUUID(),
          operation: {
            type: 'is-visible',
            visible: action.visible,
          },
          inputs: {
            expect: getExpectNode(
              getLocator(action.locator, action.frames),
              action
            ),
          },
        }
      case 'locator.toHaveValue': {
        return {
          type: 'assert',
          nodeId: crypto.randomUUID(),
          operation:
            action.expected.current === 'multiple'
              ? {
                  type: 'has-values',
                  expected: toNonEmptyStrings(
                    action.expected.values.multiple ?? []
                  ),
                }
              : {
                  type: 'has-value',
                  expected: action.expected.values.single ?? '',
                },
          inputs: {
            expect: getExpectNode(
              getLocator(action.locator, action.frames),
              action
            ),
          },
        }
      }
      case 'locator.toContainText':
        return {
          type: 'assert',
          nodeId: crypto.randomUUID(),
          operation: {
            type: 'text-contains',
            value: action.expected,
          },
          inputs: {
            expect: getExpectNode(
              getLocator(action.locator, action.frames),
              action
            ),
          },
        }
      case 'locator.fill':
        return {
          type: 'type-text',
          nodeId: crypto.randomUUID(),
          value: action.value,
          inputs: {
            locator: withTrace(
              action,
              getLocator(action.locator, action.frames)
            ),
          },
        }
      case 'locator.clear':
        return {
          type: 'clear',
          nodeId: crypto.randomUUID(),
          inputs: {
            locator: withTrace(
              action,
              getLocator(action.locator, action.frames)
            ),
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
            locator: withTrace(
              action,
              getLocator(action.locator, action.frames)
            ),
          },
        }
      }
      case 'page.waitForTimeout':
        return {
          type: 'wait-for-timeout',
          nodeId: crypto.randomUUID(),
          timeout: action.timeout,
          inputs: {
            page: withTrace(action, getPage()),
          },
        }
      case 'page.waitForNavigation':
      case 'page.close':
      case 'locator.dblclick':
      case 'locator.type':
      case 'locator.hover':
      case 'locator.setChecked':
      case 'locator.tap':
      case 'locator.press':
      case 'locator.focus':
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
  options,
  trace = false,
}: {
  browserActions: AnyBrowserAction[]
  options?: BrowserTestOptions
  trace?: boolean
}): Test {
  return {
    defaultScenario: {
      nodes: buildBrowserNodeGraphFromActions(browserActions, trace),
    },
    scenarios: {},
    options,
  }
}
