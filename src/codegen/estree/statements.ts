import { TSESTree as ts } from '@typescript-eslint/types'

import { baseProps, NodeType } from './nodes'
import { NodeOptions } from './types'

export function block(body: ts.Statement[]): ts.BlockStatement {
  return {
    ...baseProps,
    type: NodeType.BlockStatement,
    body,
  }
}

export function expressionStatement({
  expression,
  directive,
}: NodeOptions<ts.ExpressionStatement, 'expression'>): ts.ExpressionStatement {
  return {
    ...baseProps,
    type: NodeType.ExpressionStatement,
    expression,
    directive,
  }
}
