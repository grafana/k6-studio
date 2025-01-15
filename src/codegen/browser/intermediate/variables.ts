import { exhaustive } from '@/utils/typescript'
import { Expression, Statement, Scenario } from './ast'
import { IntermediateContext } from './context'

function subtituteExpression(
  node: Expression,
  substitutions: Map<string, string>
): Expression {
  switch (node.type) {
    case 'Identifier':
      return {
        type: 'Identifier',
        name: substitutions.get(node.name) ?? node.name,
      }

    case 'StringLiteral':
      return node

    case 'NewPageExpression':
      return node

    case 'GotoExpression':
      return {
        type: 'GotoExpression',
        target: subtituteExpression(node.target, substitutions),
        url: subtituteExpression(node.url, substitutions),
      }

    case 'ReloadExpression':
      return {
        type: 'ReloadExpression',
        target: subtituteExpression(node.target, substitutions),
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
        value: subtituteExpression(node.value, substitutions),
      }

    case 'ExpressionStatement':
      return {
        type: 'ExpressionStatement',
        expression: subtituteExpression(node.expression, substitutions),
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
