import { exhaustive } from '@/utils/typescript'

import { Expression, Statement, Scenario, Assertion } from './ast'
import { IntermediateContext } from './context'

type Substitutions = Map<string, string>

function substituteAssertion(
  assertion: Assertion,
  substitutions: Substitutions
): Assertion {
  switch (assertion.type) {
    case 'TextContainsAssertion':
      return {
        type: 'TextContainsAssertion',
        text: substituteExpression(assertion.text, substitutions),
      }

    case 'IsHiddenAssertion':
    case 'IsVisibleAssertion':
      return assertion

    default:
      return exhaustive(assertion)
  }
}

function substituteExpression(
  node: Expression,
  substitutions: Substitutions
): Expression {
  switch (node.type) {
    case 'StringLiteral':
    case 'NewPageExpression':
    case 'ClickOptionsExpression':
      return node

    case 'Identifier':
      return {
        type: 'Identifier',
        name: substitutions.get(node.name) ?? node.name,
      }

    case 'NewLocatorExpression':
      return {
        type: 'NewLocatorExpression',
        page: substituteExpression(node.page, substitutions),
        selector: substituteExpression(node.selector, substitutions),
      }

    case 'GotoExpression':
      return {
        type: 'GotoExpression',
        target: substituteExpression(node.target, substitutions),
        url: substituteExpression(node.url, substitutions),
      }

    case 'ReloadExpression':
      return {
        type: 'ReloadExpression',
        target: substituteExpression(node.target, substitutions),
      }

    case 'ClickExpression':
      return {
        type: 'ClickExpression',
        options: node.options
          ? substituteExpression(node.options, substitutions)
          : null,
        locator: substituteExpression(node.locator, substitutions),
      }

    case 'TypeTextExpression':
      return {
        type: 'TypeTextExpression',
        target: substituteExpression(node.target, substitutions),
        value: substituteExpression(node.value, substitutions),
      }

    case 'CheckExpression':
      return {
        type: 'CheckExpression',
        checked: substituteExpression(node.checked, substitutions),
        locator: substituteExpression(node.locator, substitutions),
      }

    case 'SelectOptionsExpression':
      return {
        type: 'SelectOptionsExpression',
        locator: substituteExpression(node.locator, substitutions),
        selected: node.selected.map((expression) =>
          substituteExpression(expression, substitutions)
        ),
        multiple: node.multiple,
      }

    case 'ExpectExpression':
      return {
        type: 'ExpectExpression',
        actual: substituteExpression(node.actual, substitutions),
        expected: substituteAssertion(node.expected, substitutions),
      }

    default:
      return exhaustive(node)
  }
}

function substituteStatement(
  node: Statement,
  substitutions: Substitutions
): Statement {
  switch (node.type) {
    case 'VariableDeclaration':
      return {
        type: 'VariableDeclaration',
        kind: node.kind,
        name: substitutions.get(node.name) ?? node.name,
        value: substituteExpression(node.value, substitutions),
      }

    case 'ExpressionStatement':
      return {
        type: 'ExpressionStatement',
        expression: substituteExpression(node.expression, substitutions),
      }

    default:
      return exhaustive(node)
  }
}

export function substituteVariables(
  context: IntermediateContext,
  scenario: Scenario
): Scenario {
  const substitutions = context.substitutions()

  return {
    ...scenario,
    body: scenario.body.map((node) => substituteStatement(node, substitutions)),
  }
}
