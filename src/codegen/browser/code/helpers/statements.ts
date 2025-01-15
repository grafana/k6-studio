import { BlockStatement, ExpressionStatement, Statement } from '../../tstree'
import { baseProps, NodeType } from './nodes'
import { NodeOptions } from './types'

export function block(body: Statement[]): BlockStatement {
  return {
    ...baseProps,
    type: NodeType.BlockStatement,
    body,
  }
}

export function expressionStatement({
  expression,
  directive,
}: NodeOptions<ExpressionStatement, 'expression'>): ExpressionStatement {
  return {
    ...baseProps,
    type: NodeType.ExpressionStatement,
    expression,
    directive,
  }
}
