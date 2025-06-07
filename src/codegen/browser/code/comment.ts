import { AST_NODE_TYPES, TSESTree as ts } from '@typescript-eslint/types'

import { baseProps } from '@/codegen/estree/nodes'

export function comment(value: string): ts.BlockStatement {
  // The type of node here is not important since it's just being used as
  // a placeholder for the comment. A BlockStatement just happens to be one
  // of the simplest nodes to build.
  return {
    ...baseProps,
    type: AST_NODE_TYPES.BlockStatement,
    comment: value,
    body: [],
  }
}
