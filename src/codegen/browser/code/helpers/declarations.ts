import {
  ConstDeclaration,
  FunctionDeclaration,
  LetOrConstOrVarDeclaration,
  VariableDeclarator,
  VariableDeclaratorMaybeInit,
} from '../../tstree'
import { baseProps, NodeType } from './nodes'
import { NodeOptions } from './types'

export function declareConst({
  declarations,
  declare = false,
}: NodeOptions<ConstDeclaration, 'declarations'>): LetOrConstOrVarDeclaration {
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
}: NodeOptions<FunctionDeclaration, 'params' | 'body'>): FunctionDeclaration {
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
  VariableDeclarator,
  'id' | 'init'
>): VariableDeclaratorMaybeInit {
  return {
    ...baseProps,
    type: NodeType.VariableDeclarator,
    id,
    init,
    definite: false,
  }
}
