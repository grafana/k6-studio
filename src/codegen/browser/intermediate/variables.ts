import { exhaustive } from '@/utils/typescript'
import { Expression, Statement, Scenario } from './ast'
import { IntermediateContext } from './context'

function substituteExpression(
  node: Expression,
  substitutions: Map<string, string>
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

    default:
      return exhaustive(node)
  }
}

function substituteStatement(
  node: Statement,
  substitutions: Map<string, string>
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
