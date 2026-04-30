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
        return visit(node.actual) || visitAssertion(node.expected)

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
        loadProfile.stages.map((s) =>
          fromObjectLiteral({ target: s.target, duration: s.duration })
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

  const withDefaultScenario = defaultScenario
    ? {
        [defaultScenario.name ?? 'default']: emitExecutor(
          defaultScenario,
          loadProfile
        ),
      }
    : {}

  const withNamedScenarios = Object.entries(scenarios).reduce(
    (acc, [name, scenario]) => {
      acc[name] = emitExecutor(scenario, loadProfile, name)
      return acc
    },
    withDefaultScenario as Record<string, ts.ObjectExpression>
  )

  return fromObjectLiteral(withNamedScenarios)
}

function emitThresholds(
  thresholds: BrowserTestOptions['thresholds']
): ts.ObjectExpression {
  const data = generateThresholds(thresholds)

  const entries = Object.entries(data).reduce(
    (acc, [metric, conditions]) => {
      acc[metric] = fromArrayLiteral(
        conditions.map((c) => {
          if (typeof c === 'string') {
            return c
          }
          return fromObjectLiteral({
            threshold: c.threshold,
            abortOnFail: c.abortOnFail,
          })
        })
      )
      return acc
    },
    {} as Record<string, ts.Expression>
  )

  return fromObjectLiteral(entries)
}

function emitCloudOptions(
  cloud: BrowserTestOptions['cloud']
): ts.ObjectExpression | undefined {
  const result = generateCloudOptions(cloud)

  if (!('cloud' in result) || result.cloud === undefined) {
    return undefined
  }

  const distribution = result.cloud.distribution
  const zoneEntries = Object.entries(distribution).reduce(
    (acc, [key, zone]) => {
      acc[key] = fromObjectLiteral({
        loadZone: zone.loadZone,
        percent: zone.percent,
      })
      return acc
    },
    {} as Record<string, ts.Expression>
  )

  return fromObjectLiteral({
    distribution: fromObjectLiteral(zoneEntries),
  })
}

export function emitOptions(test: ir.Test): ts.ObjectExpression {
  const settings = test.settings ?? defaultBrowserTestOptions

  const data: Record<string, ts.Expression | undefined> = {
    scenarios: emitScenarioOptions(test, settings.loadProfile),
  }

  const cloud = emitCloudOptions(settings.cloud)
  if (cloud !== undefined) {
    data.cloud = cloud
  }

  if (settings.thresholds.length > 0) {
    data.thresholds = emitThresholds(settings.thresholds)
  }

  return fromObjectLiteral(data)
}
