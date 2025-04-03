import { TSESTree as ts } from '@typescript-eslint/types'

import { baseProps, NodeType } from './nodes'
import { NodeOptions } from './types'

export function declareConst({
  declarations,
  declare = false,
}: NodeOptions<
  ts.ConstDeclaration,
  'declarations'
>): ts.LetOrConstOrVarDeclaration {
  return {
    ...baseProps,
    type: NodeType.VariableDeclaration,
    declarations,
    kind: 'const',
    declare,
  }
}

export function declareFunction({
  id = null,
  params,
  body,
  async = false,
  generator = false,
  declare = false,
  expression = false,
  returnType,
  typeParameters,
}: NodeOptions<
  ts.FunctionDeclaration,
  'params' | 'body'
>): ts.FunctionDeclaration {
  return {
    ...baseProps,
    type: NodeType.FunctionDeclaration,
    id,
    params,
    body,
    async,
    generator,
    declare,
    expression,
    returnType,
    typeParameters,
  }
}

export function constDeclarator({
  id,
  init,
}: NodeOptions<
  ts.VariableDeclarator,
  'id' | 'init'
>): ts.VariableDeclaratorMaybeInit {
  return {
    ...baseProps,
    type: NodeType.VariableDeclarator,
    id,
    init,
    definite: false,
  }
}
