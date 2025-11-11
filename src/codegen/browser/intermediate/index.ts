import { mapNonEmpty } from '@/utils/list'
import { exhaustive } from '@/utils/typescript'

import * as m from '../types'

import * as ir from './ast'
import { IntermediateContext } from './context'
import { substituteVariables } from './variables'

function emitPageNode(context: IntermediateContext, node: m.PageNode) {
  const expression: ir.NewPageExpression = {
    type: 'NewPageExpression',
  }

  context.declare({
    kind: 'const',
    node,
    name: 'page',
    value: expression,
  })
}

function emitGotoNode(context: IntermediateContext, node: m.GotoNode) {
  const page = context.reference(node.inputs.page)

  // Skip goto for implicit navigation, as it will be triggered by preceding action
  if (node.source === 'implicit') {
    return
  }

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

function emitLocatorNode(context: IntermediateContext, node: m.LocatorNode) {
  const page = context.reference(node.inputs.page)

  // We always inline locator nodes for readability. If we implement better
  // logic for generating variable names, then we could consider declaring
  // a variable for it if there are multiple references.
  switch (node.selector.type) {
    case 'role':
      context.inline(node, {
        type: 'NewRoleLocatorExpression',
        role: {
          type: 'StringLiteral',
          value: node.selector.role,
        },
        name: {
          type: 'StringLiteral',
          // getByRole creates an internal selector, e.g. internal:role=link[name='Hello's] that is passed
          // to the browser. Since the string literal value is wrapped in single quotes, we need to escape
          // any single quotes in the name. Bug report: https://github.com/grafana/k6/issues/5360
          value: node.selector.name.replaceAll("'", "\\'"),
        },
        page,
      })
      break

    case 'label':
      context.inline(node, {
        type: 'NewLabelLocatorExpression',
        text: {
          type: 'StringLiteral',
          value: node.selector.text,
        },
        page,
      })
      break

    case 'placeholder':
      context.inline(node, {
        type: 'NewPlaceholderLocatorExpression',
        text: {
          type: 'StringLiteral',
          value: node.selector.text,
        },
        page,
      })
      break

    case 'title':
      context.inline(node, {
        type: 'NewTitleLocatorExpression',
        text: {
          type: 'StringLiteral',
          value: node.selector.text,
        },
        page,
      })
      break

    case 'alt':
      context.inline(node, {
        type: 'NewAltTextLocatorExpression',
        text: {
          type: 'StringLiteral',
          value: node.selector.text,
        },
        page,
      })
      break

    case 'test-id':
      context.inline(node, {
        type: 'NewTestIdLocatorExpression',
        testId: {
          type: 'StringLiteral',
          value: node.selector.testId,
        },
        page,
      })
      break

    case 'css':
      context.inline(node, {
        type: 'NewCssLocatorExpression',
        selector: {
          type: 'StringLiteral',
          value: node.selector.selector,
        },
        page,
      })
      break

    default:
      exhaustive(node.selector)
  }
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
  const page = context.reference(node.inputs.page)

  const expression: ir.ClickExpression = {
    type: 'ClickExpression',
    locator,
    options,
  }

  if (node.triggersNavigation) {
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

function emitCheckNode(context: IntermediateContext, node: m.CheckNode) {
  const locator = context.reference(node.inputs.locator)

  context.emit({
    type: 'ExpressionStatement',
    expression: {
      type: 'CheckExpression',
      locator,
      checked: {
        type: 'StringLiteral',
        value: node.checked ? 'checked' : 'unchecked',
      },
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
      selected: node.selected.map((value) => ({
        type: 'StringLiteral',
        value,
      })),
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

    case 'has-values': {
      return {
        type: 'HasValueAssertion',
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

function emitAssertNode(context: IntermediateContext, node: m.AssertNode) {
  const locator = context.reference(node.inputs.locator)

  context.emit({
    type: 'ExpressionStatement',
    expression: {
      type: 'ExpectExpression',
      actual: locator,
      expected: emitAssertion(context, node.operation),
    },
  })
}

function emitNode(context: IntermediateContext, node: m.TestNode) {
  switch (node.type) {
    case 'page':
      return emitPageNode(context, node)

    case 'locator':
      return emitLocatorNode(context, node)

    case 'goto':
      return emitGotoNode(context, node)

    case 'reload':
      return emitReloadNode(context, node)

    case 'click':
      return emitClickNode(context, node)

    case 'type-text':
      return emitTypeTextNode(context, node)

    case 'check':
      return emitCheckNode(context, node)

    case 'select-options':
      return emitSelectOptionsNode(context, node)

    case 'assert':
      return emitAssertNode(context, node)

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
  }
}
