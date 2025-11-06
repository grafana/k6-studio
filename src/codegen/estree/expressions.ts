import { TSESTree as ts } from '@typescript-eslint/types'

import { exhaustive } from '@/utils/typescript'

import { baseProps, NodeType } from './nodes'
import { NodeOptions } from './types'

type LiteralOrExpression = ts.Expression | string | number | boolean | null

function fromLiteralOrExpression(value: LiteralOrExpression): ts.Expression {
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

export function string(value: string): ts.StringLiteral {
  return {
    ...baseProps,
    type: NodeType.Literal,
    value,
    raw: JSON.stringify(value),
  }
}

export function literal({
  value,
}: NodeOptions<ts.Literal, 'value'>): ts.Literal {
  switch (typeof value) {
    case 'string':
      return string(value)

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

type IdentifierOptions = Partial<
  Omit<ts.Identifier, 'name' | 'typeAnnotation' | keyof ts.NodeOrTokenData> & {
    typeAnnotation?: ts.TypeNode
  }
>

export function identifier(
  name: string,
  options: IdentifierOptions = {}
): ts.Identifier {
  const { optional = false, decorators = [], typeAnnotation } = options

  return {
    ...baseProps,
    type: NodeType.Identifier,
    name,
    optional,
    decorators,
    typeAnnotation: typeAnnotation && {
      ...baseProps,
      type: NodeType.TSTypeAnnotation,
      typeAnnotation,
    },
  }
}

export function property({
  key,
  value,
  kind = 'init',
  method = false,
  optional = false,
  shorthand = false,
}: NodeOptions<
  ts.PropertyNonComputedName,
  'key' | 'value'
>): ts.PropertyNonComputedName {
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
}: NodeOptions<
  ts.PropertyNonComputedName,
  'key' | 'value'
>): ts.PropertyNonComputedName {
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
}: NodeOptions<ts.ObjectExpression, 'properties'>): ts.ObjectExpression {
  return {
    ...baseProps,
    type: NodeType.ObjectExpression,
    properties,
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

export function array({
  elements,
}: NodeOptions<ts.ArrayExpression, 'elements'>): ts.ArrayExpression {
  return {
    ...baseProps,
    type: NodeType.ArrayExpression,
    elements,
  }
}

export function fromArrayLiteral(elements: LiteralOrExpression[]) {
  return array({
    elements: elements.map(fromLiteralOrExpression),
  })
}

function coerceType(type: ts.TypeNode | string): ts.TypeNode {
  if (typeof type === 'string') {
    return {
      ...baseProps,
      type: NodeType.TSTypeReference,
      typeName: identifier(type),
      typeArguments: undefined,
    }
  }

  return type
}

export function $this(): ts.ThisExpression {
  return {
    ...baseProps,
    type: NodeType.ThisExpression,
  }
}

interface AwaitedContext {
  awaited(): void
}

interface CallOptions {
  optional?: boolean
  typeParameters?: ts.TypeNode[]
}

type ExpressionLike = ExpressionBuilder<ts.Expression> | ts.Expression

function coerceExpression(expr: ExpressionLike): ts.Expression {
  if (expr instanceof ExpressionBuilder) {
    return expr.done()
  }

  return expr
}

export class ExpressionBuilder<Expr extends ts.Expression> {
  private expression: Expr

  constructor(expression: Expr) {
    this.expression = expression
  }

  member(
    name: ExpressionLike | ts.PrivateIdentifier | string,
    optional = false
  ) {
    const nameExpression =
      typeof name === 'string'
        ? identifier(name)
        : name instanceof ExpressionBuilder
          ? coerceExpression(name)
          : name

    if (
      nameExpression.type !== NodeType.Identifier &&
      nameExpression.type !== NodeType.PrivateIdentifier
    ) {
      return new ExpressionBuilder<ts.MemberExpression>({
        ...baseProps,
        type: NodeType.MemberExpression,
        computed: true,
        object: this.expression,
        property: nameExpression,
        optional,
      })
    }

    return new ExpressionBuilder<ts.MemberExpression>({
      ...baseProps,
      computed: false,
      type: NodeType.MemberExpression,
      object: this.expression,
      property: nameExpression,
      optional,
    })
  }

  call(args: Array<ExpressionLike>, options: CallOptions = {}) {
    const { optional = false } = options

    const typeParameters =
      options.typeParameters !== undefined && options.typeParameters.length > 0
        ? options.typeParameters
        : undefined

    const expression: ts.CallExpression = {
      ...baseProps,
      type: NodeType.CallExpression,
      callee: this.expression,
      arguments: args.map(coerceExpression),
      optional,
      typeArguments: typeParameters && {
        ...baseProps,
        type: NodeType.TSTypeParameterInstantiation,
        params: typeParameters,
      },
    }

    return new ExpressionBuilder(expression)
  }

  new(
    args: Array<ExpressionLike>,
    options: Omit<CallOptions, 'optional'> = {}
  ) {
    const typeParameters =
      options.typeParameters !== undefined && options.typeParameters.length > 0
        ? options.typeParameters
        : undefined

    const expression: ts.NewExpression = {
      ...baseProps,
      type: NodeType.NewExpression,
      callee: this.expression,
      arguments: args.map(coerceExpression),
      typeArguments: typeParameters && {
        ...baseProps,
        type: NodeType.TSTypeParameterInstantiation,
        params: typeParameters,
      },
    }

    return new ExpressionBuilder(expression)
  }

  assign(value: ExpressionLike) {
    return new ExpressionBuilder({
      ...baseProps,
      type: NodeType.AssignmentExpression,
      operator: '=',
      left: this.expression,
      right: coerceExpression(value),
    })
  }

  calculate(
    operator: ts.BinaryExpression['operator'],
    right: ExpressionBuilder<ts.Expression> | ts.Expression
  ) {
    const rightExpr = right instanceof ExpressionBuilder ? right.done() : right

    return new ExpressionBuilder({
      ...baseProps,
      type: NodeType.BinaryExpression,
      operator,
      left: this.expression,
      right: rightExpr,
    })
  }

  nullish(fallback: ExpressionLike) {
    return new ExpressionBuilder({
      ...baseProps,
      type: NodeType.LogicalExpression,
      operator: '??',
      left: this.expression,
      right: coerceExpression(fallback),
    })
  }

  as(type: ts.TypeNode | string) {
    return new ExpressionBuilder({
      ...baseProps,
      type: NodeType.TSAsExpression,
      expression: this.expression,
      typeAnnotation: coerceType(type),
    })
  }

  await(context: AwaitedContext) {
    context.awaited()

    return new ExpressionBuilder({
      ...baseProps,
      type: NodeType.AwaitExpression,
      argument: this.expression,
    })
  }

  removeAwait() {
    if (this.expression.type !== NodeType.AwaitExpression) {
      return this
    }

    return new ExpressionBuilder(this.expression.argument)
  }

  done() {
    return this.expression
  }

  statement(): ts.ExpressionStatement {
    return {
      ...baseProps,
      type: NodeType.ExpressionStatement,
      directive: undefined,
      expression: this.expression,
    }
  }

  returned(): ts.ReturnStatement {
    return {
      ...baseProps,
      type: NodeType.ReturnStatement,
      argument: this.expression,
    }
  }
}

export class ObjectBuilder {
  static empty() {
    return new ObjectBuilder().done()
  }

  static from(obj: Record<string, LiteralOrExpression | undefined>) {
    return new ObjectBuilder()
      .reduce(Object.entries(obj), (acc, [key, value]) => {
        if (value === undefined) {
          return acc
        }

        return acc.property(key, fromLiteralOrExpression(value))
      })
      .done()
  }

  #properties: ts.Property[]

  constructor(properties: ts.Property[] = []) {
    this.#properties = properties
  }

  property(name: ts.Identifier | string, value?: ts.Expression): ObjectBuilder
  property(name: ts.Expression, value: ts.Expression): ObjectBuilder
  property(name: ts.Expression | string, value?: ts.Expression): ObjectBuilder {
    const key = typeof name === 'string' ? identifier(name) : name

    if (key.type === NodeType.Identifier) {
      const property: ts.Property = {
        ...baseProps,
        type: NodeType.Property,
        computed: false,
        key,
        shorthand: value === undefined,
        kind: 'init',
        method: false,
        optional: false,
        value: value ?? key,
      }

      return new ObjectBuilder([...this.#properties, property])
    }

    if (value === undefined) {
      throw new Error('Computed property requires a value')
    }

    const property: ts.Property = {
      ...baseProps,
      type: NodeType.Property,
      computed: true,
      key,
      shorthand: false,
      kind: 'init',
      method: false,
      optional: false,
      value,
    }

    return new ObjectBuilder([...this.#properties, property])
  }

  reduce<T>(
    items: T[],
    callback: (acc: ObjectBuilder, item: T) => ObjectBuilder
  ): ObjectBuilder {
    return items.reduce<ObjectBuilder>((acc, item) => {
      return callback(acc, item)
    }, this)
  }

  done(): ts.ObjectExpression {
    return {
      ...baseProps,
      type: NodeType.ObjectExpression,
      properties: this.#properties,
    }
  }
}
