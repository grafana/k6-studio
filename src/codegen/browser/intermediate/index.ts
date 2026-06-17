import { ElementLocator } from '@/schemas/locator'
import { mapNonEmpty } from '@/utils/list'
import { exhaustive } from '@/utils/typescript'

import * as m from '../types'

import * as ir from './ast'
import { IntermediateContext } from './context'
import { substituteVariables } from './variables'

function emitTraceNode(context: IntermediateContext, node: m.TraceNode) {
  const previous = context.reference(node.inputs.previous)

  context.inline(node, {
    type: 'TraceExpression',
    traceId: node.traceId,
    target: previous,
  })
}

function emitPageNode(context: IntermediateContext, node: m.PageNode) {
  const expression: ir.NewPageExpression = {
    type: 'NewPageExpression',
  }

  context.allocate({
    node,
    name: 'page',
    value: expression,
    dispose(expression) {
      return {
        type: 'ExpressionStatement',
        expression: {
          type: 'ClosePageExpression',
          target: expression,
        },
      }
    },
  })
}

function emitGotoNode(context: IntermediateContext, node: m.GotoNode) {
  const page = context.reference(node.inputs.page)

  context.emit({
    type: 'ExpressionStatement',
    expression: {
      type: 'GotoExpression',
      target: page,
      url: {
        type: 'StringLiteral',
        value: node.url,
      },
    },
  })
}

function emitReloadNode(context: IntermediateContext, node: m.ReloadNode) {
  const page = context.reference(node.inputs.page)

  context.emit({
    type: 'ExpressionStatement',
    expression: {
      type: 'ReloadExpression',
      target: page,
    },
  })
}

function toLocatorExpression(
  base: ir.Expression,
  locator: ElementLocator
): ir.Expression {
  switch (locator.type) {
    case 'role':
      return {
        type: 'NewRoleLocatorExpression',
        role: {
          type: 'StringLiteral',
          value: locator.role,
        },
        options: locator.options?.name
          ? {
              type: 'RoleLocatorOptionsExpression',
              name: {
                // getByRole creates an internal selector, e.g. internal:role=link[name='Hello's] that is passed
                // to the browser. Since the string literal value is wrapped in single quotes, we need to escape
                // any single quotes in the name. Bug report: https://github.com/grafana/k6/issues/5360
                value: locator.options.name.replaceAll("'", "\\'"),
                exact: locator.options.exact || undefined,
              },
            }
          : null,
        page: base,
      }

    case 'label':
      return {
        type: 'NewLabelLocatorExpression',
        text: {
          type: 'StringLiteral',
          value: locator.label,
        },
        page: base,
        options: locator.options?.exact
          ? {
              type: 'TextLocatorOptionsExpression',
              exact: locator.options.exact,
            }
          : null,
      }

    case 'placeholder':
      return {
        type: 'NewPlaceholderLocatorExpression',
        text: {
          type: 'StringLiteral',
          value: locator.placeholder,
        },
        page: base,
        options: locator.options?.exact
          ? {
              type: 'TextLocatorOptionsExpression',
              exact: locator.options.exact,
            }
          : null,
      }

    case 'title':
      return {
        type: 'NewTitleLocatorExpression',
        text: {
          type: 'StringLiteral',
          value: locator.title,
        },
        page: base,
        options: locator.options?.exact
          ? {
              type: 'TextLocatorOptionsExpression',
              exact: locator.options.exact,
            }
          : null,
      }

    case 'alt':
      return {
        type: 'NewAltTextLocatorExpression',
        text: {
          type: 'StringLiteral',
          value: locator.text,
        },
        page: base,
        options: locator.options?.exact
          ? {
              type: 'TextLocatorOptionsExpression',
              exact: locator.options.exact,
            }
          : null,
      }

    case 'testid':
      return {
        type: 'NewTestIdLocatorExpression',
        testId: {
          type: 'StringLiteral',
          value: locator.testId,
        },
        page: base,
      }

    case 'css':
      return {
        type: 'NewCssLocatorExpression',
        selector: {
          type: 'StringLiteral',
          value: locator.selector,
        },
        page: base,
      }

    case 'text':
      throw new Error(
        'Code generation for getByText locator is not implemented yet.'
      )

    default:
      return exhaustive(locator)
  }
}

// Build the scope an element locator is created on: the page, optionally wrapped
// in a chain of frame locators (outermost first). A CSS frame uses the more
// readable `frameLocator(selector)`. Other locator types must go through
// `<locator>.contentFrame()` because `frameLocator` only accepts a string
// selector.
function toFrameScope(
  page: ir.Expression,
  frames: ElementLocator[] | undefined
): ir.Expression {
  return (frames ?? []).reduce<ir.Expression>((parent, frame) => {
    if (frame.type === 'css') {
      return {
        type: 'NewFrameLocatorExpression',
        parent,
        selector: {
          type: 'StringLiteral',
          value: frame.selector,
        },
      }
    }

    return {
      type: 'ContentFrameExpression',
      target: toLocatorExpression(parent, frame),
    }
  }, page)
}

function emitLocatorNode(context: IntermediateContext, node: m.LocatorNode) {
  const page = context.reference(node.inputs.page)
  const scope = toFrameScope(page, node.frames)

  // We always inline locator nodes for readability. If we implement better
  // logic for generating variable names, then we could consider declaring
  // a variable for it if there are multiple references.
  context.inline(node, toLocatorExpression(scope, node.locator))
}

function getClickOptions(node: m.ClickNode): ir.ClickOptionsExpression | null {
  const modifiers: ir.ClickOptionsExpression['modifiers'] = [
    node.modifiers.ctrl && ('Control' as const),
    node.modifiers.shift && ('Shift' as const),
    node.modifiers.alt && ('Alt' as const),
    node.modifiers.meta && ('Meta' as const),
  ].filter((modifier) => modifier !== false)

  if (node.button === 'left' && modifiers.length === 0) {
    return null
  }

  return {
    type: 'ClickOptionsExpression',
    button: node.button,
    modifiers,
  }
}

function wrapWithWaitForNavigation(
  expression: ir.Expression,
  page: ir.Expression
): ir.Statement {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'PromiseAllExpression',
      expressions: [
        {
          type: 'WaitForNavigationExpression',
          target: page,
        },
        expression,
      ],
    },
  }
}

function emitClickNode(context: IntermediateContext, node: m.ClickNode) {
  const locator = context.reference(node.inputs.locator)
  const options = getClickOptions(node)

  const expression: ir.ClickExpression = {
    type: 'ClickExpression',
    locator,
    options,
  }

  if (node.waitForNavigation !== undefined) {
    const page = context.reference(node.waitForNavigation.page)

    context.emit(wrapWithWaitForNavigation(expression, page))

    return
  }

  context.emit({
    type: 'ExpressionStatement',
    expression,
  })
}

function emitTypeTextNode(context: IntermediateContext, node: m.TypeTextNode) {
  const locator = context.reference(node.inputs.locator)

  context.emit({
    type: 'ExpressionStatement',
    expression: {
      type: 'FillTextExpression',
      target: locator,
      value: {
        type: 'StringLiteral',
        value: node.value,
      },
    },
  })
}

function emitClearNode(context: IntermediateContext, node: m.ClearNode) {
  const locator = context.reference(node.inputs.locator)

  context.emit({
    type: 'ExpressionStatement',
    expression: {
      type: 'ClearExpression',
      locator,
    },
  })
}

function emitCheckNode(context: IntermediateContext, node: m.CheckNode) {
  const locator = context.reference(node.inputs.locator)

  context.emit({
    type: 'ExpressionStatement',
    expression: {
      type: 'CheckExpression',
      locator,
      checked: node.checked,
    },
  })
}

function emitSelectOptionsNode(
  context: IntermediateContext,
  node: m.SelectOptionsNode
) {
  const locator = context.reference(node.inputs.locator)

  context.emit({
    type: 'ExpressionStatement',
    expression: {
      type: 'SelectOptionsExpression',
      locator,
      selected: node.selected.map((value) => {
        if (typeof value === 'string') {
          return {
            type: 'StringLiteral',
            value,
          }
        }

        return {
          type: 'SelectOptionValueExpression',
          ...value,
        }
      }),
      multiple: node.multiple,
    },
  })
}

function emitAssertion(
  context: IntermediateContext,
  assertion: m.AssertionOperation
): ir.Assertion {
  switch (assertion.type) {
    case 'text-contains':
      return {
        type: 'TextContainsAssertion',
        text: {
          type: 'StringLiteral',
          value: assertion.value,
        },
      }

    case 'is-visible':
      return assertion.visible
        ? { type: 'IsVisibleAssertion' }
        : { type: 'IsHiddenAssertion' }

    case 'is-checked':
      if (assertion.inputType === 'aria') {
        return {
          type: 'IsAttributeEqualToAssertion',
          attribute: {
            type: 'StringLiteral',
            value: 'aria-checked',
          },
          value: {
            type: 'StringLiteral',
            value:
              assertion.expected === 'checked'
                ? 'true'
                : assertion.expected === 'unchecked'
                  ? 'false'
                  : 'mixed',
          },
        }
      }

      if (assertion.expected === 'indeterminate') {
        return { type: 'IsIndeterminateAssertion' }
      }

      if (assertion.expected === 'unchecked') {
        return { type: 'IsNotCheckedAssertion' }
      }

      return { type: 'IsCheckedAssertion' }

    case 'has-value': {
      return {
        type: 'HasValueAssertion',
        expected: {
          type: 'StringLiteral',
          value: assertion.expected,
        },
      }
    }

    case 'has-values': {
      return {
        type: 'HasValuesAssertion',
        expected: mapNonEmpty(assertion.expected, (value) => {
          return {
            type: 'StringLiteral',
            value,
          }
        }),
      }
    }

    default:
      return exhaustive(assertion)
  }
}

function emitExpectNode(context: IntermediateContext, node: m.ExpectNode) {
  const locator = context.reference(node.inputs.locator)

  context.inline(node, {
    type: 'ExpectExpression',
    actual: locator,
  })
}

function emitAssertNode(context: IntermediateContext, node: m.AssertNode) {
  const expect = context.reference(node.inputs.expect)

  context.emit({
    type: 'ExpressionStatement',
    expression: {
      type: 'AssertExpression',
      expect,
      assertion: emitAssertion(context, node.operation),
    },
  })
}

function getWaitForOptions(
  node: m.WaitForNode
): ir.WaitForOptionsExpression | null {
  if (
    typeof node.options?.state === 'undefined' &&
    typeof node.options?.timeout === 'undefined'
  ) {
    return null
  }

  return {
    type: 'WaitForOptionsExpression',
    timeout: node.options?.timeout,
    state: node.options?.state,
  }
}

function emitWaitForNode(context: IntermediateContext, node: m.WaitForNode) {
  const locator = context.reference(node.inputs.locator)

  context.emit({
    type: 'ExpressionStatement',
    expression: {
      type: 'WaitForExpression',
      target: locator,
      options: getWaitForOptions(node),
    },
  })
}

function emitWaitForTimeoutNode(
  context: IntermediateContext,
  node: m.WaitForTimeoutNode
) {
  const page = context.reference(node.inputs.page)

  context.emit({
    type: 'ExpressionStatement',
    expression: {
      type: 'WaitForTimeoutExpression',
      target: page,
      timeout: node.timeout,
    },
  })
}

function emitNode(context: IntermediateContext, node: m.TestNode) {
  switch (node.type) {
    case 'trace':
      return emitTraceNode(context, node)

    case 'page':
      return emitPageNode(context, node)

    case 'locator':
      return emitLocatorNode(context, node)

    case 'goto':
      return emitGotoNode(context, node)

    case 'reload':
      return emitReloadNode(context, node)

    case 'clear':
      return emitClearNode(context, node)

    case 'click':
      return emitClickNode(context, node)

    case 'type-text':
      return emitTypeTextNode(context, node)

    case 'check':
      return emitCheckNode(context, node)

    case 'select-options':
      return emitSelectOptionsNode(context, node)

    case 'expect':
      return emitExpectNode(context, node)

    case 'assert':
      return emitAssertNode(context, node)

    case 'wait-for':
      return emitWaitForNode(context, node)

    case 'wait-for-timeout':
      return emitWaitForTimeoutNode(context, node)

    default:
      return exhaustive(node)
  }
}

function emitScenario(scenario: m.Scenario): ir.Scenario {
  const context = new IntermediateContext(scenario)

  for (const node of scenario.nodes) {
    emitNode(context, node)
  }

  return substituteVariables(context, {
    type: 'Scenario',
    body: context.done(),
  })
}

function emitDefaultScenario(scenario: m.DefaultScenario): ir.DefaultScenario {
  const intermediate = emitScenario(scenario)

  return {
    ...intermediate,
    name: scenario.name,
  }
}

export function toIntermediateAst(test: m.Test): ir.Test {
  const scenarios = Object.entries(test.scenarios).map(([name, scenario]) => {
    const intermediate = emitScenario(scenario)

    return [name, intermediate] as const
  })

  return {
    defaultScenario:
      test.defaultScenario && emitDefaultScenario(test.defaultScenario),
    scenarios: Object.fromEntries(scenarios),
    options: test.options,
  }
}
