import { exhaustive } from '@/utils/typescript'
import {
  ArrayExpression,
  CallExpression,
  Expression,
  ExpressionStatement,
  Identifier,
  Literal,
  MemberExpression,
  ObjectExpression,
  PrivateIdentifier,
  PropertyNonComputedName,
  StringLiteral,
} from '../../tstree'
import { baseProps, NodeType } from './nodes'
import { NodeOptions } from './types'

type LiteralOrExpression = Expression | string | number | boolean | null

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

export function string(value: string): StringLiteral {
  return {
    ...baseProps,
    type: NodeType.Literal,
    value,
    raw: JSON.stringify(value),
  }
}

export function literal({ value }: NodeOptions<Literal, 'value'>): Literal {
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
  options: NodeOptions<Identifier, 'name'> | string
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
}: NodeOptions<
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
}: NodeOptions<
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
}: NodeOptions<ObjectExpression, 'properties'>): ObjectExpression {
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
}: NodeOptions<ArrayExpression, 'elements'>): ArrayExpression {
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

  call(options: NodeOptions<CallExpression, never, 'callee'> | Expression[]) {
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

  asStatement(): ExpressionStatement {
    return {
      ...baseProps,
      type: NodeType.ExpressionStatement,
      directive: undefined,
      expression: this.expression,
    }
  }
}
