import { exhaustive } from '@/utils/typescript'
import {
  AST_NODE_TYPES,
  BlockStatement,
  CallExpression,
  ConstDeclaration,
  ExportDefaultDeclaration,
  ExportNamedDeclarationWithoutSourceWithSingle,
  Expression,
  ExpressionStatement,
  FunctionDeclaration,
  Identifier,
  LetOrConstOrVarDeclaration,
  Literal,
  MemberExpression,
  Node,
  ObjectExpression,
  PrivateIdentifier,
  Program,
  Property,
  PropertyNonComputedName,
  Range,
  SourceLocation,
  Statement,
  VariableDeclaratorMaybeInit,
} from '../tstree'

// Since we're generating our own AST we don't have any positional information, but
// the types require it. To fix it, we spread this dummy object into the nodes we create.
const baseProps = {
  loc: null as unknown as SourceLocation,
  range: null as unknown as Range,
}

const NodeType = AST_NODE_TYPES

type OptionsFrom<
  T extends Node | Property,
  RequiredProps extends keyof T,
  OmitProps extends keyof T = never,
> = Partial<
  Omit<T, RequiredProps | OmitProps | 'type' | keyof typeof baseProps>
> &
  Pick<T, RequiredProps>

type LiteralOrExpression = Expression | string | number | boolean | null

export function literal({ value }: OptionsFrom<Literal, 'value'>): Literal {
  switch (typeof value) {
    case 'string':
      return {
        ...baseProps,
        type: NodeType.Literal,
        value,
        raw: JSON.stringify(value),
      }

    case 'number':
      return {
        ...baseProps,
        type: NodeType.Literal,
        value,
        raw: value.toString(),
      }

    case 'boolean':
      return {
        ...baseProps,
        type: NodeType.Literal,
        value,
        raw: value ? 'true' : 'false',
      }

    case 'bigint':
      return {
        ...baseProps,
        type: NodeType.Literal,
        value,
        bigint: `${value}n`,
        raw: `${value}n`,
      }

    case 'object':
      if (value === null) {
        return {
          ...baseProps,
          type: NodeType.Literal,
          value: null,
          raw: 'null',
        }
      }

      return {
        ...baseProps,
        type: NodeType.Literal,
        value,
        regex: {
          flags: value.flags,
          pattern: value.source,
        },
        raw: `/${value.source}/${value.flags}`,
      }

    default:
      return exhaustive(value)
  }
}

export function identifier(
  options: OptionsFrom<Identifier, 'name'> | string
): Identifier {
  const {
    name,
    optional = false,
    decorators = [],
    typeAnnotation,
  } = typeof options === 'string'
    ? { name: options, typeAnnotation: undefined }
    : options

  return {
    ...baseProps,
    type: NodeType.Identifier,
    name,
    optional,
    decorators,
    typeAnnotation,
  }
}

export function property({
  key,
  value,
  kind = 'init',
  method = false,
  optional = false,
  shorthand = false,
}: OptionsFrom<
  PropertyNonComputedName,
  'key' | 'value'
>): PropertyNonComputedName {
  return {
    ...baseProps,
    type: NodeType.Property,
    computed: false,
    key,
    value,
    kind,
    method,
    optional,
    shorthand,
  }
}

export function computedProperty({
  key,
  value,
  kind = 'init',
  method = false,
  optional = false,
  shorthand = false,
}: OptionsFrom<
  PropertyNonComputedName,
  'key' | 'value'
>): PropertyNonComputedName {
  return {
    ...baseProps,
    type: NodeType.Property,
    computed: false,
    key,
    value,
    kind,
    method,
    optional,
    shorthand,
  }
}

export function object({
  properties,
}: OptionsFrom<ObjectExpression, 'properties'>): ObjectExpression {
  return {
    ...baseProps,
    type: NodeType.ObjectExpression,
    properties,
  }
}

export function declareConst({
  declarations,
  declare = false,
}: OptionsFrom<ConstDeclaration, 'declarations'>): LetOrConstOrVarDeclaration {
  return {
    ...baseProps,
    type: NodeType.VariableDeclaration,
    declarations,
    kind: 'const',
    declare,
  }
}

export function block(body: Statement[]): BlockStatement {
  return {
    ...baseProps,
    type: NodeType.BlockStatement,
    body,
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
}: OptionsFrom<FunctionDeclaration, 'params' | 'body'>): FunctionDeclaration {
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

export function constDeclaration({
  id,
  init,
}: OptionsFrom<
  VariableDeclaratorMaybeInit,
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

export function exportNamed({
  exportKind = 'value',
  declaration,
}: OptionsFrom<
  ExportNamedDeclarationWithoutSourceWithSingle,
  'declaration'
>): ExportNamedDeclarationWithoutSourceWithSingle {
  return {
    ...baseProps,
    type: NodeType.ExportNamedDeclaration,
    assertions: [],
    specifiers: [],
    attributes: [],
    source: null,
    exportKind,
    declaration,
  }
}

export function exportDefault({
  declaration,
}: OptionsFrom<
  ExportDefaultDeclaration,
  'declaration'
>): ExportDefaultDeclaration {
  return {
    ...baseProps,
    type: NodeType.ExportDefaultDeclaration,
    declaration,
    exportKind: 'value',
  }
}

export function program({
  body,
  comments = [],
  sourceType = 'module',
  tokens,
}: OptionsFrom<Program, 'body'>): Program {
  return {
    ...baseProps,
    type: NodeType.Program,
    body,
    comments,
    sourceType,
    tokens,
  }
}

function fromLiteralOrExpression(value: LiteralOrExpression): Expression {
  switch (typeof value) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'bigint':
      return literal({ value })

    case 'object':
      if (value === null) {
        return literal({ value: null })
      }

      return value

    default:
      return exhaustive(value)
  }
}

export function fromObjectLiteral(
  node: Record<string, LiteralOrExpression | undefined>
) {
  return object({
    properties: Object.entries(node).flatMap(([key, value]) => {
      if (value === undefined) {
        return []
      }

      return property({
        key: identifier(key),
        value: fromLiteralOrExpression(value),
      })
    }),
  })
}

export class ExpressionBuilder<Expr extends Expression> {
  private expression: Expr

  constructor(expression: Expr) {
    this.expression = expression
  }

  member(name: Expression | PrivateIdentifier | string, optional = false) {
    const nameExpression = typeof name === 'string' ? identifier(name) : name

    if (
      nameExpression.type !== NodeType.Identifier &&
      nameExpression.type !== NodeType.PrivateIdentifier
    ) {
      return new ExpressionBuilder<MemberExpression>({
        ...baseProps,
        type: NodeType.MemberExpression,
        computed: true,
        object: this.expression,
        property: nameExpression,
        optional,
      })
    }

    return new ExpressionBuilder<MemberExpression>({
      ...baseProps,
      computed: false,
      type: NodeType.MemberExpression,
      object: this.expression,
      property: nameExpression,
      optional,
    })
  }

  call(options: OptionsFrom<CallExpression, never, 'callee'> | Expression[]) {
    const {
      arguments: args = [],
      optional = false,
      typeArguments,
    } = Array.isArray(options)
      ? { arguments: options, typeArguments: undefined }
      : options

    const expression: CallExpression = {
      ...baseProps,
      type: NodeType.CallExpression,
      callee: this.expression,
      arguments: args,
      optional,
      typeArguments,
    }

    return new ExpressionBuilder(expression)
  }

  done() {
    return this.expression
  }

  asStatement(): ExpressionStatement {
    return {
      ...baseProps,
      type: NodeType.ExpressionStatement,
      directive: undefined,
      expression: this.expression,
    }
  }
}
