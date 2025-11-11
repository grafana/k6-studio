import { TSESTree as ts } from '@typescript-eslint/types'

import {
  identifier,
  expressionStatement,
  string,
  ExpressionBuilder,
  declareConst,
  constDeclarator,
  fromArrayLiteral,
  fromObjectLiteral,
  ObjectBuilder,
} from '@/codegen/estree'
import { mapNonEmpty } from '@/utils/list'
import { exhaustive } from '@/utils/typescript'

import { spaceBetween } from '../formatting/spacing'
import * as ir from '../intermediate/ast'

import { ScenarioContext } from './context'

function emitNewPageExpression(
  context: ScenarioContext,
  _expression: ir.NewPageExpression
): ts.Expression {
  context.import(['browser'], 'k6/browser')

  return new ExpressionBuilder(identifier('browser'))
    .member('newPage')
    .call([])
    .await(context)
    .done()
}

function emitNewRoleLocatorExpression(
  context: ScenarioContext,
  expression: ir.NewRoleLocatorExpression
): ts.Expression {
  const page = emitExpression(context, expression.page)
  const role = emitExpression(context, expression.role)
  const name = emitExpression(context, expression.name)

  return new ExpressionBuilder(page)
    .member('getByRole')
    .call([role, fromObjectLiteral({ name, exact: true })])
    .done()
}

function emitNewLabelLocatorExpression(
  context: ScenarioContext,
  expression: ir.NewLabelLocatorExpression
): ts.Expression {
  const page = emitExpression(context, expression.page)
  const text = emitExpression(context, expression.text)

  return new ExpressionBuilder(page)
    .member('getByLabel')
    .call([text, ObjectBuilder.from({ exact: true })])
    .done()
}

function emitNewAltTextLocatorExpression(
  context: ScenarioContext,
  expression: ir.NewAltTextLocatorExpression
): ts.Expression {
  const page = emitExpression(context, expression.page)
  const text = emitExpression(context, expression.text)

  return new ExpressionBuilder(page)
    .member('getByAltText')
    .call([text, ObjectBuilder.from({ exact: true })])
    .done()
}

function emitNewPlaceholderLocatorExpression(
  context: ScenarioContext,
  expression: ir.NewPlaceholderLocatorExpression
): ts.Expression {
  const page = emitExpression(context, expression.page)
  const text = emitExpression(context, expression.text)

  return new ExpressionBuilder(page)
    .member('getByPlaceholder')
    .call([text, ObjectBuilder.from({ exact: true })])
    .done()
}

function emitNewTitleLocatorExpression(
  context: ScenarioContext,
  expression: ir.NewTitleLocatorExpression
): ts.Expression {
  const page = emitExpression(context, expression.page)
  const text = emitExpression(context, expression.text)

  return new ExpressionBuilder(page)
    .member('getByTitle')
    .call([text, ObjectBuilder.from({ exact: true })])
    .done()
}

function emitNewCSSLocatorExpression(
  context: ScenarioContext,
  expression: ir.NewCssLocatorExpression
): ts.Expression {
  const page = emitExpression(context, expression.page)
  const selector = emitExpression(context, expression.selector)

  return new ExpressionBuilder(page).member('locator').call([selector]).done()
}

function emitNewTestIdLocatorExpression(
  context: ScenarioContext,
  expression: ir.NewTestIdLocatorExpression
): ts.Expression {
  const page = emitExpression(context, expression.page)
  const testId = emitExpression(context, expression.testId)

  return new ExpressionBuilder(page).member('getByTestId').call([testId]).done()
}

function emitGotoExpression(
  context: ScenarioContext,
  expression: ir.GotoExpression
): ts.Expression {
  const target = emitExpression(context, expression.target)

  return new ExpressionBuilder(target)
    .member('goto')
    .call([emitExpression(context, expression.url)])
    .await(context)
    .done()
}

function emitReloadExpression(
  context: ScenarioContext,
  expression: ir.ReloadExpression
): ts.Expression {
  const target = emitExpression(context, expression.target)

  return new ExpressionBuilder(target)
    .member('reload')
    .call([])
    .await(context)
    .done()
}

function emitClickOptionsExpression(
  _context: ScenarioContext,
  expression: ir.ClickOptionsExpression
): ts.Expression {
  const button = expression.button !== 'left' && {
    button: string(expression.button),
  }

  const modifiers = expression.modifiers.length > 0 && {
    modifiers: fromArrayLiteral(expression.modifiers.map(string)),
  }

  return fromObjectLiteral({
    ...button,
    ...modifiers,
  })
}

function emitClickExpression(
  context: ScenarioContext,
  expression: ir.ClickExpression
): ts.Expression {
  const locator = emitExpression(context, expression.locator)
  const args =
    expression.options !== null
      ? [emitExpression(context, expression.options)]
      : []

  return new ExpressionBuilder(locator)
    .member('click')
    .call(args)
    .await(context)
    .done()
}

function emitTypeTextExpression(
  context: ScenarioContext,
  expression: ir.FillTextExpression
): ts.Expression {
  const target = emitExpression(context, expression.target)
  const value = emitExpression(context, expression.value)

  return new ExpressionBuilder(target)
    .member('fill')
    .call([value])
    .await(context)
    .done()
}

function emitCheckExpression(
  context: ScenarioContext,
  expression: ir.CheckExpression
): ts.Expression {
  const locator = emitExpression(context, expression.locator)

  const member = expression.checked ? 'check' : 'uncheck'

  return new ExpressionBuilder(locator)
    .member(member)
    .call([])
    .await(context)
    .done()
}

function emitSelectOptionsExpression(
  context: ScenarioContext,
  expression: ir.SelectOptionsExpression
): ts.Expression {
  const locator = emitExpression(context, expression.locator)

  const selected =
    !expression.multiple && expression.selected[0] !== undefined
      ? emitExpression(context, expression.selected[0])
      : fromArrayLiteral(
          expression.selected.map((value) => emitExpression(context, value))
        )

  return new ExpressionBuilder(locator)
    .member('selectOption')
    .call([selected])
    .await(context)
    .done()
}

function emitExpectExpression(
  context: ScenarioContext,
  expression: ir.ExpectExpression
): ts.Expression {
  context.import(['expect'], 'https://jslib.k6.io/k6-testing/0.5.0/index.js')

  const locator = emitExpression(context, expression.actual)

  const expect = new ExpressionBuilder(identifier('expect'))
    .call([locator])
    .done()

  switch (expression.expected.type) {
    case 'TextContainsAssertion': {
      const text = emitExpression(context, expression.expected.text)

      return new ExpressionBuilder(expect)
        .member('toContainText')
        .call([text])
        .await(context)
        .done()
    }

    case 'IsHiddenAssertion':
      return new ExpressionBuilder(expect)
        .member('toBeHidden')
        .call([])
        .await(context)
        .done()

    case 'IsVisibleAssertion':
      return new ExpressionBuilder(expect)
        .member('toBeVisible')
        .call([])
        .await(context)
        .done()

    case 'IsCheckedAssertion':
      return new ExpressionBuilder(expect)
        .member('toBeChecked')
        .call([])
        .await(context)
        .done()

    case 'IsNotCheckedAssertion':
      return new ExpressionBuilder(expect)
        .member('not')
        .member('toBeChecked')
        .call([])
        .await(context)
        .done()

    case 'IsIndeterminateAssertion':
      return new ExpressionBuilder(expect)
        .member('toBeChecked')
        .call([
          fromObjectLiteral({
            indeterminate: true,
          }),
        ])
        .await(context)
        .done()

    case 'IsAttributeEqualToAssertion':
      return new ExpressionBuilder(expect)
        .member('toHaveAttribute')
        .call([
          emitExpression(context, expression.expected.attribute),
          emitExpression(context, expression.expected.value),
        ])
        .await(context)
        .done()

    case 'HasValueAssertion': {
      const expectedValues = mapNonEmpty(
        expression.expected.expected,
        (value) => emitExpression(context, value)
      )

      if (expectedValues.length === 1) {
        return new ExpressionBuilder(expect)
          .member('toHaveValue')
          .call([expectedValues[0]])
          .await(context)
          .done()
      }

      return new ExpressionBuilder(expect)
        .member('toHaveValues')
        .call([fromArrayLiteral(expectedValues)])
        .await(context)
        .done()
    }

    default: {
      return exhaustive(expression.expected)
    }
  }
}

function emitWaitForNavigationExpression(
  context: ScenarioContext,
  expression: ir.WaitForNavigationExpression
): ts.Expression {
  const target = emitExpression(context, expression.target)

  return new ExpressionBuilder(target)
    .member('waitForNavigation')
    .call([])
    .await(context)
    .done()
}

function emitPromiseAllExpression(
  context: ScenarioContext,
  expression: ir.PromiseAllExpression
): ts.Expression {
  const expressions = expression.expressions.map((expr) =>
    // No need to await inside Promise.all
    new ExpressionBuilder(emitExpression(context, expr)).removeAwait().done()
  )

  return new ExpressionBuilder(identifier('Promise'))
    .member('all')
    .call([fromArrayLiteral(expressions)])
    .await(context)
    .done()
}

function emitExpression(
  context: ScenarioContext,
  expression: ir.Expression
): ts.Expression {
  switch (expression.type) {
    case 'StringLiteral':
      return string(expression.value)

    case 'Identifier':
      return identifier(expression.name)

    case 'NewPageExpression':
      return emitNewPageExpression(context, expression)

    case 'NewRoleLocatorExpression':
      return emitNewRoleLocatorExpression(context, expression)

    case 'NewLabelLocatorExpression':
      return emitNewLabelLocatorExpression(context, expression)

    case 'NewAltTextLocatorExpression':
      return emitNewAltTextLocatorExpression(context, expression)

    case 'NewPlaceholderLocatorExpression':
      return emitNewPlaceholderLocatorExpression(context, expression)

    case 'NewTitleLocatorExpression':
      return emitNewTitleLocatorExpression(context, expression)

    case 'NewCssLocatorExpression':
      return emitNewCSSLocatorExpression(context, expression)

    case 'NewTestIdLocatorExpression':
      return emitNewTestIdLocatorExpression(context, expression)

    case 'GotoExpression':
      return emitGotoExpression(context, expression)

    case 'ReloadExpression':
      return emitReloadExpression(context, expression)

    case 'ClickExpression':
      return emitClickExpression(context, expression)

    case 'ClickOptionsExpression':
      return emitClickOptionsExpression(context, expression)

    case 'FillTextExpression':
      return emitTypeTextExpression(context, expression)

    case 'CheckExpression':
      return emitCheckExpression(context, expression)

    case 'SelectOptionsExpression':
      return emitSelectOptionsExpression(context, expression)

    case 'ExpectExpression':
      return emitExpectExpression(context, expression)

    case 'WaitForNavigationExpression':
      return emitWaitForNavigationExpression(context, expression)

    case 'PromiseAllExpression':
      return emitPromiseAllExpression(context, expression)

    default:
      return exhaustive(expression)
  }
}

function emitStatement(
  context: ScenarioContext,
  statement: ir.Statement
): ts.Statement {
  switch (statement.type) {
    case 'ExpressionStatement':
      return expressionStatement({
        expression: emitExpression(context, statement.expression),
      })

    case 'VariableDeclaration':
      return declareConst({
        declarations: [
          constDeclarator({
            id: identifier(statement.name),
            init: emitExpression(context, statement.value),
          }),
        ],
      })

    default:
      return exhaustive(statement)
  }
}

export function emitScenarioBody(
  context: ScenarioContext,
  scenario: ir.Scenario
) {
  return spaceBetween(scenario.body.map((node) => emitStatement(context, node)))
}
