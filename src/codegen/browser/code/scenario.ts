import { exhaustive } from '@/utils/typescript'
import * as ir from '../intermediate/ast'
import { TSESTree as ts } from '@typescript-eslint/types'
import { ScenarioContext } from './context'
import {
  identifier,
  expressionStatement,
  string,
  ExpressionBuilder,
  declareConst,
  constDeclarator,
  fromArrayLiteral,
  fromObjectLiteral,
} from '@/codegen/estree'
import { spaceBetween } from '../formatting/spacing'

function emitNewPageExpression(
  context: ScenarioContext,
  _expression: ir.NewPageExpression
): ts.Expression {
  context.import(['browser'], 'k6/browser')

  return new ExpressionBuilder(identifier({ name: 'browser' }))
    .member('newPage')
    .call([])
    .await(context)
    .done()
}

function emitNewLocatorExpression(
  context: ScenarioContext,
  expression: ir.NewLocatorExpression
): ts.Expression {
  const page = emitExpression(context, expression.page)
  const selector = emitExpression(context, expression.selector)

  return new ExpressionBuilder(page).member('locator').call([selector]).done()
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
  context: ScenarioContext,
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

function emitExpression(
  context: ScenarioContext,
  expression: ir.Expression
): ts.Expression {
  switch (expression.type) {
    case 'StringLiteral':
      return string(expression.value)

    case 'Identifier':
      return identifier({ name: expression.name })

    case 'NewPageExpression':
      return emitNewPageExpression(context, expression)

    case 'NewLocatorExpression':
      return emitNewLocatorExpression(context, expression)

    case 'GotoExpression':
      return emitGotoExpression(context, expression)

    case 'ReloadExpression':
      return emitReloadExpression(context, expression)

    case 'ClickExpression':
      return emitClickExpression(context, expression)

    case 'ClickOptionsExpression':
      return emitClickOptionsExpression(context, expression)

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
            id: identifier({ name: statement.name }),
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
