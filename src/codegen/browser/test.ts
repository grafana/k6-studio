import { keyBy } from 'lodash-es'

import { AnyBrowserAction, BrowserTestOptions } from '@/schemas/browserTest'
import {
  ElementLocator,
  ElementLocatorOptions,
  LocatorOptions,
} from '@/schemas/locator'
import { toClickButton, toClickModifiers } from '@/utils/clickOptions'
import { flattenLocators, isLocatorEqual } from '@/utils/locator'
import { exhaustive } from '@/utils/typescript'

import {
  TestNode,
  PageNode,
  NewTabPromiseNode,
  NodeRef,
  Test,
  LocatorNode,
} from './types'

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

  function getLocator(locatorOptions: ElementLocatorOptions): NodeRef {
    const currentLocator = toElementLocator(locatorOptions)
    const frames = flattenLocators(locatorOptions.parent)
      .map((frame) => {
        if (frame.type === 'element') {
          throw new Error(
            'Nested element locators are currently not supported.'
          )
        }

        return frame
      })
      .map(toElementLocator)
      .toArray()
      .toReversed()

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
            locator: withTrace(action, getLocator(action.locator)),
          },
          options: action.options,
        }
      case 'locator.click':
        return {
          type: 'click',
          nodeId: crypto.randomUUID(),
          button: toClickButton(action.options),
          modifiers: toClickModifiers(action.options?.modifiers),
          // A click that switches to a new page never navigates the page it
          // was made on, so waiting for a navigation there would hang.
          waitForNavigation:
            action.options?.waitForNavigation &&
            !action.options.switchesToNewPage
              ? { page: getPage() }
              : undefined,
          inputs: {
            locator: withTrace(action, getLocator(action.locator)),
          },
        }
      case 'locator.check':
        return {
          type: 'check',
          nodeId: crypto.randomUUID(),
          checked: true,
          inputs: {
            locator: withTrace(action, getLocator(action.locator)),
          },
        }
      case 'locator.uncheck':
        return {
          type: 'check',
          nodeId: crypto.randomUUID(),
          checked: false,
          inputs: {
            locator: withTrace(action, getLocator(action.locator)),
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
            expect: getExpectNode(getLocator(action.locator), action),
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
            expect: getExpectNode(getLocator(action.locator), action),
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
            expect: getExpectNode(getLocator(action.locator), action),
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
            expect: getExpectNode(getLocator(action.locator), action),
          },
        }
      case 'locator.fill':
        return {
          type: 'type-text',
          nodeId: crypto.randomUUID(),
          value: action.value,
          inputs: {
            locator: withTrace(action, getLocator(action.locator)),
          },
        }
      case 'locator.clear':
        return {
          type: 'clear',
          nodeId: crypto.randomUUID(),
          inputs: {
            locator: withTrace(action, getLocator(action.locator)),
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
            locator: withTrace(action, getLocator(action.locator)),
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
    const switchesToNewPage =
      action.method === 'locator.click' &&
      action.options?.switchesToNewPage === true

    if (!switchesToNewPage) {
      nodes.push(toNode(action))
      return
    }

    // The promise for the new page must be created before the click that
    // opens it.
    const promiseNode: NewTabPromiseNode = {
      type: 'new-tab-promise',
      nodeId: crypto.randomUUID(),
      inputs: {
        page: getPage(),
      },
    }

    nodes.push(promiseNode, toNode(action))

    // The rest of the test continues on the page the click opened.
    currentPage = {
      type: 'page',
      nodeId: crypto.randomUUID(),
      promise: toNodeRef(promiseNode),
    }

    nodes.push(currentPage)
  })

  return nodes
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
