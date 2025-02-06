import { exhaustive } from '@/utils/typescript'
import { TSESTree as ts } from '@typescript-eslint/types'
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

export function identifier(
  options: NodeOptions<ts.Identifier, 'name'> | string
): ts.Identifier {
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

interface AwaitedContext {
  awaited(): void
}

export class ExpressionBuilder<Expr extends ts.Expression> {
  private expression: Expr

  constructor(expression: Expr) {
    this.expression = expression
  }

  member(
    name: ts.Expression | ts.PrivateIdentifier | string,
    optional = false
  ) {
    const nameExpression = typeof name === 'string' ? identifier(name) : name

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

  call(
    options: NodeOptions<ts.CallExpression, never, 'callee'> | ts.Expression[]
  ) {
    const {
      arguments: args = [],
      optional = false,
      typeArguments,
    } = Array.isArray(options)
      ? { arguments: options, typeArguments: undefined }
      : options

    const expression: ts.CallExpression = {
      ...baseProps,
      type: NodeType.CallExpression,
      callee: this.expression,
      arguments: args,
      optional,
      typeArguments,
    }

    return new ExpressionBuilder(expression)
  }

  await(context: AwaitedContext) {
    context.awaited()

    return new ExpressionBuilder({
      ...baseProps,
      type: NodeType.AwaitExpression,
      argument: this.expression,
    })
  }

  done() {
    return this.expression
  }

  asStatement(): ts.ExpressionStatement {
    return {
      ...baseProps,
      type: NodeType.ExpressionStatement,
      directive: undefined,
      expression: this.expression,
    }
  }
}
