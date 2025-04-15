import { TSESTree as ts } from '@typescript-eslint/types'

import { baseProps, NodeType } from './nodes'
import { NodeOptions } from './types'

export function program({
  body,
  comments = [],
  sourceType = 'module',
  tokens,
}: NodeOptions<ts.Program, 'body'>): ts.Program {
  return {
    ...baseProps,
    type: NodeType.Program,
    body,
    comments,
    sourceType,
    tokens,
  }
}

export * from './modules'
export * from './declarations'
export * from './statements'
export * from './expressions'
