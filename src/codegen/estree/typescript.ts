import { TSESTree as ts } from '@typescript-eslint/types'

import { identifier, string } from './expressions'
import { baseProps, NodeType } from './nodes'

export type TypeConstructor<Params extends Record<string, ts.TypeNode>> =
  | ((params: Params) => ts.TypeNode)
  | ts.TypeNode

export interface TypeParameterOptions {
  extends?: ts.TypeNode
  default?: ts.TypeNode
  const?: boolean
  in?: boolean
  out?: boolean
}

export function buildType<Params extends Record<string, ts.TypeNode>>(
  type: TypeConstructor<Params>,
  params: Params
): ts.TypeNode {
  return typeof type === 'function' ? type(params) : type
}

export function typeName(base: string, ...rest: string[]): ts.EntityName {
  return rest.reduce<ts.EntityName>((ref, name) => {
    return {
      ...baseProps,
      type: NodeType.TSQualifiedName,
      left: ref,
      right: identifier(name),
    }
  }, identifier(base))
}

export function typeRef(
  name: ts.EntityName | [string, ...string[]] | string,
  parameters: ts.TypeNode[] = []
): ts.TSTypeReference {
  const coercedTypeName = Array.isArray(name)
    ? typeName(name[0], ...name.slice(1))
    : typeof name === 'string'
      ? typeName(name)
      : name

  const params = parameters.length > 0 ? parameters : undefined

  return {
    ...baseProps,
    type: NodeType.TSTypeReference,
    typeName: coercedTypeName,
    typeArguments: params && {
      ...baseProps,
      type: NodeType.TSTypeParameterInstantiation,
      params: params,
    },
  }
}

interface InterfaceBuilderOptions<Params extends Record<string, ts.TypeNode>> {
  typeBindings: Params
  typeParameters?: ts.TSTypeParameter[]
  members?: ts.TSPropertySignature[]
}

export class InterfaceBuilder<Params extends Record<string, ts.TypeNode>> {
  static define<Name extends string>(name: Name) {
    return new InterfaceBuilder(name, {
      typeBindings: {},
    })
  }

  #name: string

  #options: Required<InterfaceBuilderOptions<Params>>

  constructor(name: string, options: InterfaceBuilderOptions<Params>) {
    this.#name = name
    this.#options = {
      typeParameters: [],
      members: [],
      ...options,
    }
  }

  typeParam<Name extends string>(
    name: Name,
    options: TypeParameterOptions = {}
  ): InterfaceBuilder<Params & { [K in Name]: ts.TypeNode }> {
    const typeParameter: ts.TSTypeParameter = {
      ...baseProps,
      type: NodeType.TSTypeParameter,
      name: identifier(name),
      constraint: options.extends,
      default: options.default,
      const: options.const === true,
      in: options.in === true,
      out: options.out === true,
    }

    return new InterfaceBuilder(name, {
      ...this.#options,
      typeParameters: [...this.#options.typeParameters, typeParameter],
      typeBindings: {
        ...this.#options.typeBindings,
        [name]: typeRef(name),
      },
    })
  }

  property(name: string, type: TypeConstructor<Params>) {
    const property: ts.TSPropertySignature = {
      ...baseProps,
      type: NodeType.TSPropertySignature,
      key: identifier(name),
      typeAnnotation: {
        ...baseProps,
        type: NodeType.TSTypeAnnotation,
        typeAnnotation: buildType(type, this.#options.typeBindings),
      },
      optional: false,
      accessibility: undefined,
      readonly: false,
      computed: false,
      static: false,
    }

    return new InterfaceBuilder<Params>(this.#name, {
      ...this.#options,
      members: [...this.#options.members, property],
    })
  }

  optional(name: string, type: TypeConstructor<Params>) {
    const property: ts.TSPropertySignature = {
      ...baseProps,
      type: NodeType.TSPropertySignature,
      key: identifier(name),
      typeAnnotation: {
        ...baseProps,
        type: NodeType.TSTypeAnnotation,
        typeAnnotation: buildType(type, this.#options.typeBindings),
      },
      optional: true,
      accessibility: undefined,
      readonly: false,
      computed: false,
      static: false,
    }

    return new InterfaceBuilder<Params>(this.#name, {
      ...this.#options,
      members: [...this.#options.members, property],
    })
  }

  reduce<T>(items: T[], callback: (builder: this, item: T) => this) {
    return items.reduce<this>((builder, item) => {
      return callback(builder, item)
    }, this)
  }

  done(): ts.TSInterfaceDeclaration {
    const typeParameters =
      this.#options.typeParameters.length > 0
        ? this.#options.typeParameters
        : undefined

    return {
      ...baseProps,
      type: NodeType.TSInterfaceDeclaration,
      id: identifier(this.#name),
      typeParameters: typeParameters && {
        ...baseProps,
        type: NodeType.TSTypeParameterDeclaration,
        params: typeParameters,
      },
      declare: false,
      extends: [],
      body: {
        ...baseProps,
        type: NodeType.TSInterfaceBody,
        body: this.#options.members,
      },
    }
  }
}

export const t = {
  undefined(): ts.TSUndefinedKeyword {
    return {
      ...baseProps,
      type: NodeType.TSUndefinedKeyword,
    }
  },
  string(literal?: string): ts.TSStringKeyword | ts.TSLiteralType {
    if (literal !== undefined) {
      return {
        ...baseProps,
        type: NodeType.TSLiteralType,
        literal: string(literal),
      }
    }

    return {
      ...baseProps,
      type: NodeType.TSStringKeyword,
    }
  },
  number(): ts.TSNumberKeyword {
    return {
      ...baseProps,
      type: NodeType.TSNumberKeyword,
    }
  },
  boolean(): ts.TSBooleanKeyword {
    return {
      ...baseProps,
      type: NodeType.TSBooleanKeyword,
    }
  },
  any(): ts.TSAnyKeyword {
    return {
      ...baseProps,
      type: NodeType.TSAnyKeyword,
    }
  },
  unknown(): ts.TSUnknownKeyword {
    return {
      ...baseProps,
      type: NodeType.TSUnknownKeyword,
    }
  },
  void(): ts.TSVoidKeyword {
    return {
      ...baseProps,
      type: NodeType.TSVoidKeyword,
    }
  },
  record(keyType: ts.TypeNode, valueType: ts.TypeNode): ts.TSTypeReference {
    return {
      ...baseProps,
      type: NodeType.TSTypeReference,
      typeName: identifier('Record'),
      typeArguments: {
        ...baseProps,
        type: NodeType.TSTypeParameterInstantiation,
        params: [keyType, valueType],
      },
    }
  },
  union(types: ts.TypeNode[]): ts.TSUnionType {
    return {
      ...baseProps,
      type: NodeType.TSUnionType,
      types,
    }
  },
  promise(type: ts.TypeNode): ts.TSTypeReference {
    return typeRef('Promise', [type])
  },
  keyOf(type: ts.TypeNode): ts.TSTypeOperator {
    return {
      ...baseProps,
      type: NodeType.TSTypeOperator,
      operator: 'keyof',
      typeAnnotation: type,
    }
  },
  index(
    objectType: ts.TypeNode,
    indexType: ts.TypeNode
  ): ts.TSIndexedAccessType {
    return {
      ...baseProps,
      type: NodeType.TSIndexedAccessType,
      objectType,
      indexType,
    }
  },
}
