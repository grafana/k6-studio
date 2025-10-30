import { TSESTree as ts } from '@typescript-eslint/types'

import { ExpressionBuilder, identifier, $this } from './expressions'
import { baseProps, NodeType } from './nodes'
import { NodeOptions } from './types'
import {
  buildType,
  TypeConstructor,
  TypeParameterOptions,
  typeRef,
} from './typescript'

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

interface FieldBuilderOptions {
  type?: ts.TypeNode | null
}

class FieldBuilder {
  #name: string

  #options: Required<FieldBuilderOptions>

  constructor(name: string, options: FieldBuilderOptions = {}) {
    this.#name = name

    this.#options = {
      type: null,
      ...options,
    }
  }

  type(type: ts.TypeNode): FieldBuilder {
    return new FieldBuilder(this.#name, {
      ...this.#options,
      type,
    })
  }

  init(value: ts.Expression | null = null): ts.PropertyDefinition {
    const { type } = this.#options

    const typeAnnotation: ts.TSTypeAnnotation | null = type && {
      ...baseProps,
      type: NodeType.TSTypeAnnotation,
      typeAnnotation: type,
    }

    return {
      ...baseProps,
      type: NodeType.PropertyDefinition,
      key: identifier(this.#name),
      accessibility: undefined,
      computed: false,
      declare: false,
      definite: false,
      decorators: [],
      optional: false,
      override: false,
      readonly: false,
      static: false,
      typeAnnotation: typeAnnotation ?? undefined,
      value: value,
    }
  }
}

interface FunctionBuilderOptions<
  Params extends Record<string, ts.Expression>,
  TypeParams extends Record<string, ts.TypeNode>,
> {
  bindings: Params
  typeParamBindings: TypeParams
  async?: boolean
  parameters?: ts.Parameter[]
  typeParameters?: ts.TSTypeParameter[]
  returnType?: ts.TypeNode | null
}

export class FunctionBuilder<
  Params extends Record<string, ts.Expression>,
  TypeParams extends Record<string, ts.TypeNode>,
> {
  static define() {
    return new FunctionBuilder({
      bindings: {},
      typeParamBindings: {},
    })
  }

  #definition: Required<FunctionBuilderOptions<Params, TypeParams>>

  constructor(options: FunctionBuilderOptions<Params, TypeParams>) {
    this.#definition = {
      async: false,
      parameters: [],
      returnType: null,
      typeParameters: [],
      ...options,
    }
  }

  async(): FunctionBuilder<Params, TypeParams> {
    return new FunctionBuilder({
      ...this.#definition,
      async: true,
    })
  }

  typeParam<Name extends string>(
    name: Name,
    options: TypeParameterOptions = {}
  ): FunctionBuilder<Params, TypeParams & { [K in Name]: ts.TypeNode }> {
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

    return new FunctionBuilder({
      ...this.#definition,
      typeParameters: [...this.#definition.typeParameters, typeParameter],
      typeParamBindings: {
        ...this.#definition.typeParamBindings,
        [name]: typeRef(name),
      },
    })
  }

  param<Name extends string>(
    name: Name,
    type?: TypeConstructor<TypeParams>
  ): FunctionBuilder<Params & { [K in Name]: ts.Expression }, TypeParams> {
    const parameter = identifier(name, {
      typeAnnotation:
        type && buildType(type, this.#definition.typeParamBindings),
    })

    return new FunctionBuilder({
      ...this.#definition,
      parameters: [...this.#definition.parameters, parameter],
      bindings: {
        ...this.#definition.bindings,
        [name]: identifier(name),
      },
    })
  }

  optional<Name extends string>(
    name: Name,
    type?: TypeConstructor<TypeParams>
  ): FunctionBuilder<Params & { [K in Name]: ts.Expression }, TypeParams> {
    const parameter = identifier(name, {
      typeAnnotation:
        type && buildType(type, this.#definition.typeParamBindings),
      optional: true,
    })

    return new FunctionBuilder({
      ...this.#definition,
      parameters: [...this.#definition.parameters, parameter],
      bindings: {
        ...this.#definition.bindings,
        [name]: identifier(name),
      },
    })
  }

  returns(
    type: TypeConstructor<TypeParams>
  ): FunctionBuilder<Params, TypeParams> {
    return new FunctionBuilder({
      ...this.#definition,
      returnType: buildType(type, this.#definition.typeParamBindings),
    })
  }

  body(
    callback: (params: Params, typeParams: TypeParams) => ts.Statement[]
  ): ts.FunctionExpression {
    const { async, parameters, bindings, typeParamBindings } = this.#definition

    const body: ts.BlockStatement = {
      ...baseProps,
      type: NodeType.BlockStatement,
      body: callback(bindings, typeParamBindings),
    }

    const returnType = this.#definition.returnType
      ? this.#definition.returnType
      : undefined

    const typeParameters =
      this.#definition.typeParameters.length > 0
        ? this.#definition.typeParameters
        : undefined

    return {
      ...baseProps,
      type: NodeType.FunctionExpression,
      id: null,
      async: async,
      generator: false,
      expression: false,
      declare: false,
      params: parameters,
      body,
      returnType: returnType && {
        ...baseProps,
        type: NodeType.TSTypeAnnotation,
        typeAnnotation: returnType,
      },
      typeParameters: typeParameters && {
        ...baseProps,
        type: NodeType.TSTypeParameterDeclaration,
        params: typeParameters,
      },
    }
  }

  reduce<T>(
    items: T[],
    reducer: (
      builder: FunctionBuilder<Params, TypeParams>,
      item: T
    ) => FunctionBuilder<Params, TypeParams>
  ) {
    return items.reduce<FunctionBuilder<Params, TypeParams>>(
      (builder, item) => reducer(builder, item),
      this
    )
  }
}

type Bindings = Record<string, ts.Expression>

interface ClassBuilderOptions<
  This extends Bindings,
  TypeParams extends Record<string, ts.TypeNode>,
> {
  self: This
  typeParameters: TypeParams
  elements?: ts.ClassElement[]
}

export class ClassBuilder<
  This extends Bindings,
  TypeParams extends Record<string, ts.TypeNode>,
> {
  static define(): ClassBuilder<Bindings, EmptyObject> {
    return new ClassBuilder({
      self: {},
      typeParameters: {},
    })
  }

  #options: Required<ClassBuilderOptions<This, TypeParams>>

  constructor(options: ClassBuilderOptions<This, TypeParams>) {
    this.#options = {
      elements: [],
      ...options,
    }
  }

  field<Name extends string>(
    name: Name,
    callback: (builder: FieldBuilder, self: This) => ts.PropertyDefinition
  ): ClassBuilder<This & { [K in Name]: ts.Expression }, TypeParams> {
    const field = callback(new FieldBuilder(name), this.#options.self)

    return new ClassBuilder({
      ...this.#options,
      elements: [...this.#options.elements, field],
      self: {
        ...this.#options.self,
        [name]: new ExpressionBuilder($this()).member(name).done(),
      },
    })
  }

  construct(
    callback: (
      builder: FunctionBuilder<EmptyObject, EmptyObject>,
      self: This
    ) => ts.FunctionExpression
  ): ClassBuilder<This, TypeParams> {
    const functionExpression = callback(
      FunctionBuilder.define(),
      this.#options.self
    )

    const ctor: ts.MethodDefinition = {
      ...baseProps,
      type: NodeType.MethodDefinition,
      key: identifier('constructor'),
      accessibility: undefined,
      computed: false,
      kind: 'constructor',
      static: false,
      optional: false,
      override: false,
      decorators: [],
      value: functionExpression,
    }

    return new ClassBuilder({
      ...this.#options,
      elements: [...this.#options.elements, ctor],
    })
  }

  method<Name extends string>(
    name: Name,
    callback: (
      builder: FunctionBuilder<EmptyObject, EmptyObject>,
      self: This
    ) => ts.FunctionExpression
  ): ClassBuilder<This & { [K in Name]: ts.Expression }, TypeParams> {
    const functionExpression = callback(
      FunctionBuilder.define(),
      this.#options.self
    )

    const method: ts.MethodDefinition = {
      ...baseProps,
      type: NodeType.MethodDefinition,
      key: identifier(name),
      accessibility: undefined,
      computed: false,
      kind: 'method',
      static: false,
      optional: false,
      override: false,
      decorators: [],
      value: functionExpression,
    }

    return new ClassBuilder({
      ...this.#options,
      elements: [...this.#options.elements, method],
      self: {
        ...this.#options.self,
        [name]: new ExpressionBuilder($this()).member(name).done(),
      },
    })
  }

  add(
    ...elements: Array<ts.MethodDefinition | ts.PropertyDefinition>
  ): ClassBuilder<This, TypeParams> {
    return new ClassBuilder({
      ...this.#options,
      elements: [...this.#options.elements, ...elements],
    })
  }

  reduce<T>(
    items: T[],
    reducer: (
      builder: ClassBuilder<This, TypeParams>,
      item: T,
      self: This
    ) => ClassBuilder<This, TypeParams>
  ) {
    return items.reduce<ClassBuilder<This, TypeParams>>(
      (builder, item) => reducer(builder, item, this.#options.self),
      this
    )
  }

  declare(name: ts.Identifier | string): ts.ClassDeclarationWithName {
    const id = typeof name === 'string' ? identifier(name) : name

    return {
      ...baseProps,
      type: NodeType.ClassDeclaration,
      id,
      abstract: false,
      declare: false,
      decorators: [],
      superClass: null,
      implements: [],
      superTypeArguments: undefined,
      typeParameters: undefined,
      body: {
        ...baseProps,
        type: NodeType.ClassBody,
        body: this.#options.elements,
      },
    }
  }
}
