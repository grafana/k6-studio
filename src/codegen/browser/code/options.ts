import { TSESTree as ts } from '@typescript-eslint/types'

import { fromObjectLiteral } from '@/codegen/estree'
import { exhaustive } from '@/utils/typescript'

import * as ir from '../intermediate/ast'

function isBrowserScenario(scenario: ir.Scenario) {
  function visitAssertion(node: ir.Assertion): boolean {
    switch (node.type) {
      case 'TextContainsAssertion':
      case 'IsVisibleAssertion':
      case 'IsHiddenAssertion':
      case 'IsCheckedAssertion':
      case 'IsNotCheckedAssertion':
      case 'IsIndeterminateAssertion':
      case 'IsAttributeEqualToAssertion':
      case 'HasValueAssertion':
        return true

      default:
        return exhaustive(node)
    }
  }

  function visit(node: ir.Node): boolean {
    switch (node.type) {
      case 'ExpressionStatement':
        return visit(node.expression)

      case 'NewPageExpression':
      case 'GotoExpression':
      case 'ReloadExpression':
      case 'NewRoleLocatorExpression':
      case 'NewLabelLocatorExpression':
      case 'NewCssLocatorExpression':
      case 'NewAltTextLocatorExpression':
      case 'NewPlaceholderLocatorExpression':
      case 'NewTitleLocatorExpression':
      case 'NewTestIdLocatorExpression':
      case 'ClickExpression':
      case 'ClickOptionsExpression':
      case 'FillTextExpression':
      case 'CheckExpression':
      case 'SelectOptionsExpression':
      case 'WaitForNavigationExpression':
        return true

      case 'Identifier':
      case 'StringLiteral':
      case 'PromiseAllExpression':
        return false

      case 'VariableDeclaration':
        return visit(node.value)

      case 'ExpectExpression':
        return visit(node.actual) || visitAssertion(node.expected)

      default:
        return exhaustive(node)
    }
  }

  return scenario.body.some(visit)
}

function emitBrowserOptions(_scenario: ir.Scenario) {
  if (!isBrowserScenario(_scenario)) {
    return undefined
  }

  return fromObjectLiteral({
    browser: fromObjectLiteral({
      type: 'chromium',
    }),
  })
}

function emitSharedIterationsExecutor(
  options: ts.ObjectExpression | undefined,
  exec?: string
) {
  return fromObjectLiteral({
    executor: 'shared-iterations',
    exec,
    options,
  })
}

function emitExecutor(scenario: ir.Scenario, exec?: string) {
  const options = emitBrowserOptions(scenario)

  return emitSharedIterationsExecutor(options, exec)
}

function emitScenarioOptions({ defaultScenario, scenarios }: ir.Test) {
  const withDefaultScenario = defaultScenario
    ? {
        [defaultScenario.name ?? 'default']: emitExecutor(defaultScenario),
      }
    : {}

  const withNamedScenarios = Object.entries(scenarios).reduce(
    (acc, [name, scenario]) => {
      acc[name] = emitExecutor(scenario, name)

      return acc
    },
    withDefaultScenario
  )

  return fromObjectLiteral(withNamedScenarios)
}

export function emitOptions(test: ir.Test) {
  return fromObjectLiteral({
    scenarios: emitScenarioOptions(test),
  })
}
