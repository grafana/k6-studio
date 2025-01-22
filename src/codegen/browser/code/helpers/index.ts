import { Program } from '../../tstree'
import { baseProps, NodeType } from './nodes'
import { NodeOptions } from './types'

export function program({
  body,
  comments = [],
  sourceType = 'module',
  tokens,
}: NodeOptions<Program, 'body'>): Program {
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
