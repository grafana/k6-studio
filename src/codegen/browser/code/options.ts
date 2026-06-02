import { TSESTree as ts } from '@typescript-eslint/types'

import { fromObjectLiteral, fromArrayLiteral } from '@/codegen/estree'
import {
  generateCloudOptions,
  generateThresholds,
} from '@/codegen/options.shared'
import {
  BrowserTestOptions,
  defaultBrowserTestOptions,
} from '@/schemas/browserTest'
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
      case 'HasValuesAssertion':
        return true

      default:
        return exhaustive(node)
    }
  }

  function visit(node: ir.Node): boolean {
    switch (node.type) {
      case 'ExpressionStatement':
        return visit(node.expression)

      case 'AssignmentStatement':
        return visit(node.value)

      case 'NewPageExpression':
      case 'ClosePageExpression':
      case 'GotoExpression':
      case 'ReloadExpression':
      case 'NewRoleLocatorExpression':
      case 'RoleLocatorOptionsExpression':
      case 'TextLocatorOptionsExpression':
      case 'NewLabelLocatorExpression':
      case 'NewCssLocatorExpression':
      case 'NewAltTextLocatorExpression':
      case 'NewPlaceholderLocatorExpression':
      case 'NewTitleLocatorExpression':
      case 'NewTestIdLocatorExpression':
      case 'ClearExpression':
      case 'ClickExpression':
      case 'ClickOptionsExpression':
      case 'FillTextExpression':
      case 'CheckExpression':
      case 'SelectOptionsExpression':
      case 'WaitForExpression':
      case 'WaitForOptionsExpression':
      case 'WaitForNavigationExpression':
      case 'WaitForTimeoutExpression':
        return true

      case 'Identifier':
      case 'StringLiteral':
      case 'NullLiteral':
      case 'SelectOptionValueExpression':
      case 'PromiseAllExpression':
        return false

      case 'VariableDeclaration':
        return visit(node.value)

      case 'Allocation':
        return (
          node.declarations.some(visit) ||
          node.statements.some(visit) ||
          node.disposers.some(visit)
        )

      case 'ExpectExpression':
        return visit(node.actual)

      case 'AssertExpression':
        return visit(node.expect) || visitAssertion(node.assertion)

      case 'TraceExpression':
        return visit(node.target)

      default:
        return exhaustive(node)
    }
  }

  return scenario.body.some(visit)
}

function emitBrowserOptions(scenario: ir.Scenario) {
  if (!isBrowserScenario(scenario)) {
    return undefined
  }

  return fromObjectLiteral({
    browser: fromObjectLiteral({
      type: 'chromium',
    }),
  })
}

function emitExecutor(
  scenario: ir.Scenario,
  loadProfile: BrowserTestOptions['loadProfile'],
  exec?: string
): ts.ObjectExpression {
  const options = emitBrowserOptions(scenario)

  if (loadProfile.executor === 'shared-iterations') {
    return fromObjectLiteral({
      executor: 'shared-iterations',
      exec,
      vus: loadProfile.vus,
      iterations: loadProfile.iterations,
      options,
    })
  }

  if (loadProfile.executor === 'ramping-vus') {
    return fromObjectLiteral({
      executor: 'ramping-vus',
      exec,
      stages: fromArrayLiteral(
        loadProfile.stages.map((stage) =>
          fromObjectLiteral({ target: stage.target, duration: stage.duration })
        )
      ),
      options,
    })
  }

  return exhaustive(loadProfile)
}

function emitScenarioOptions(
  test: ir.Test,
  loadProfile: BrowserTestOptions['loadProfile']
): ts.ObjectExpression {
  const { defaultScenario, scenarios } = test

  const withDefaultScenario: Record<string, ts.ObjectExpression> =
    defaultScenario
      ? {
          [defaultScenario.name ?? 'default']: emitExecutor(
            defaultScenario,
            loadProfile
          ),
        }
      : {}

  const namedEntries = Object.entries(scenarios).map(
    ([name, scenario]) =>
      [name, emitExecutor(scenario, loadProfile, name)] as const
  )

  return fromObjectLiteral({
    ...withDefaultScenario,
    ...Object.fromEntries(namedEntries),
  })
}

function emitThresholds(
  thresholds: BrowserTestOptions['thresholds']
): ts.ObjectExpression {
  const data = generateThresholds(thresholds)

  return fromObjectLiteral(
    Object.fromEntries(
      Object.entries(data).map(([metric, conditions]) => [
        metric,
        fromArrayLiteral(
          conditions.map((condition) => {
            if (typeof condition === 'string') {
              return condition
            }
            return fromObjectLiteral({
              threshold: condition.threshold,
              abortOnFail: condition.abortOnFail,
            })
          })
        ),
      ])
    )
  )
}

function emitCloudOptions(
  cloud: BrowserTestOptions['cloud']
): ts.ObjectExpression | undefined {
  const result = generateCloudOptions(cloud)

  if (!('cloud' in result) || result.cloud === undefined) {
    return undefined
  }

  return fromObjectLiteral({
    distribution: fromObjectLiteral(
      Object.fromEntries(
        Object.entries(result.cloud.distribution).map(([key, zone]) => [
          key,
          fromObjectLiteral({
            loadZone: zone.loadZone,
            percent: zone.percent,
          }),
        ])
      )
    ),
  })
}

export function emitOptions(test: ir.Test): ts.ObjectExpression {
  const options = test.options ?? defaultBrowserTestOptions

  const data: Record<string, ts.Expression | undefined> = {
    scenarios: emitScenarioOptions(test, options.loadProfile),
  }

  const cloud = emitCloudOptions(options.cloud)
  if (cloud !== undefined) {
    data.cloud = cloud
  }

  if (options.thresholds.length > 0) {
    data.thresholds = emitThresholds(options.thresholds)
  }

  return fromObjectLiteral(data)
}
