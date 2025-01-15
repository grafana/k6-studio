import { exhaustive } from '@/utils/typescript'
import * as ir from '../intermediate/ast'
import * as ts from '../tstree'
import { fromObjectLiteral } from './helpers'

function isBrowserScenario(scenario: ir.Scenario) {
  function visit(node: ir.Node): boolean {
    switch (node.type) {
      case 'ExpressionStatement':
        return visit(node.expression)

      case 'NewPageExpression':
      case 'GotoExpression':
      case 'ReloadExpression':
        return true

      case 'Identifier':
      case 'StringLiteral':
        return false

      case 'VariableDeclaration':
        return visit(node.value)

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
        [defaultScenario.name ?? 'browser']: emitExecutor(defaultScenario),
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
