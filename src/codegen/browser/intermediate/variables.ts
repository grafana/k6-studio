import { mapNonEmpty } from '@/utils/list'
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

    case 'IsAttributeEqualToAssertion':
      return {
        type: 'IsAttributeEqualToAssertion',
        attribute: substituteExpression(assertion.attribute, substitutions),
        value: substituteExpression(assertion.value, substitutions),
      }

    case 'HasValueAssertion':
      return {
        type: 'HasValueAssertion',
        expected: mapNonEmpty(assertion.expected, (value) =>
          substituteExpression(value, substitutions)
        ),
      }

    case 'IsHiddenAssertion':
    case 'IsVisibleAssertion':
    case 'IsCheckedAssertion':
    case 'IsNotCheckedAssertion':
    case 'IsIndeterminateAssertion':
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

    case 'NewCssLocatorExpression':
      return {
        type: 'NewCssLocatorExpression',
        page: substituteExpression(node.page, substitutions),
        selector: substituteExpression(node.selector, substitutions),
      }

    case 'NewTestIdLocatorExpression':
      return {
        type: 'NewTestIdLocatorExpression',
        page: substituteExpression(node.page, substitutions),
        testId: substituteExpression(node.testId, substitutions),
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

    case 'FillTextExpression':
      return {
        type: 'FillTextExpression',
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

    case 'PageContextExpression':
      return {
        type: 'PageContextExpression',
        page: substituteExpression(node.page, substitutions),
      }

    case 'GrantPermissionsExpression':
      return {
        type: 'GrantPermissionsExpression',
        context: substituteExpression(node.context, substitutions),
        permissions: node.permissions.map((expression) =>
          substituteExpression(expression, substitutions)
        ),
        options: node.options
          ? substituteExpression(node.options, substitutions)
          : null,
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
