import { spaceBetween } from '../formatting/spacing'
import * as ir from '../intermediate/ast'
import * as ts from '../tstree'
import {
  declareConst,
  constDeclaration,
  identifier,
  exportNamed,
  program,
  fromObjectLiteral,
  exportDefault,
  declareFunction,
  block,
  ExpressionBuilder,
  literal,
} from './helpers'

function emitBrowserEvent(_event: ir.BrowserEvent) {
  return new ExpressionBuilder(identifier('console'))
    .member('log')
    .call([literal({ value: 'dummy output' })])
    .asStatement()
}

function emitBrowserOptions(_scenario: ir.Scenario) {
  if (_scenario.type !== 'browser') {
    return undefined
  }

  return fromObjectLiteral({
    browser: fromObjectLiteral({
      type: 'chromium',
    }),
  })
}

function emitSharedIterationsExecutor(
  options: ts.ObjectExpression | undefined
) {
  return fromObjectLiteral({
    executor: 'shared-iterations',
    options,
  })
}

function emitExecutor(scenario: ir.Scenario) {
  const options = emitBrowserOptions(scenario)

  return emitSharedIterationsExecutor(options)
}

function emitScenarioOptions({ defaultScenario, scenarios }: ir.Test) {
  const withDefaultScenario = defaultScenario
    ? {
        [defaultScenario.name ?? 'default']: emitExecutor(defaultScenario),
      }
    : {}

  const withNamedScenarios = Object.entries(scenarios).reduce(
    (acc, [name, scenario]) => {
      acc[name] = emitExecutor(scenario)

      return acc
    },
    withDefaultScenario
  )

  return fromObjectLiteral(withNamedScenarios)
}

function emitOptions(test: ir.Test) {
  return fromObjectLiteral({
    scenarios: emitScenarioOptions(test),
  })
}

function emitScenarioBody(scenario: ir.Scenario) {
  switch (scenario.type) {
    case 'browser':
      return scenario.events.map(emitBrowserEvent)

    case 'http':
      return []
  }
}

export function toTypeScriptAst(test: ir.Test): ts.Program {
  const options = emitOptions(test)

  const exports = [
    test.defaultScenario &&
      exportDefault({
        declaration: declareFunction({
          id:
            test.defaultScenario.name !== undefined
              ? identifier(test.defaultScenario.name)
              : undefined,
          params: [],
          body: block(emitScenarioBody(test.defaultScenario)),
        }),
      }),
  ]

  return program({
    body: spaceBetween([
      exportNamed({
        declaration: declareConst({
          declarations: [
            constDeclaration({
              id: identifier('options'),
              init: options,
            }),
          ],
        }),
      }),
      ...exports.filter((item) => item !== undefined),
    ]),
  })
}
