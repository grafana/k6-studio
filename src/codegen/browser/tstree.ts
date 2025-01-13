/* eslint-disable import/export */
export type NewLine = 'before' | 'after' | 'both' | 'none'

export interface NodeOrTokenData {
  /**
   * Used to tell the formatter when to force a newline between nodes.
   */
  newLine?: NewLine
}

// Everything beneath the DO NOT MODIFY banner has been copied from @typescript-eslint/types/dist/generated/ast-spec.d.ts

/**********************************************
 *      DO NOT MODIFY THIS FILE MANUALLY      *
 *                                            *
 *  THIS FILE HAS BEEN COPIED FROM ast-spec.  *
 * ANY CHANGES WILL BE LOST ON THE NEXT BUILD *
 *                                            *
 *   MAKE CHANGES TO ast-spec AND THEN RUN    *
 *                 yarn build                 *
 **********************************************/
import type { SyntaxKind } from 'typescript'
export type Accessibility = 'private' | 'protected' | 'public'
export type AccessorProperty =
  | AccessorPropertyComputedName
  | AccessorPropertyNonComputedName
export interface AccessorPropertyComputedName
  extends PropertyDefinitionComputedNameBase {
  type: AST_NODE_TYPES.AccessorProperty
}
export interface AccessorPropertyNonComputedName
  extends PropertyDefinitionNonComputedNameBase {
  type: AST_NODE_TYPES.AccessorProperty
}
export interface ArrayExpression extends BaseNode {
  /**
   * an element will be `null` in the case of a sparse array: `[1, ,3]`
   */
  elements: (Expression | SpreadElement | null)[]
  type: AST_NODE_TYPES.ArrayExpression
}
export interface ArrayPattern extends BaseNode {
  decorators: Decorator[]
  elements: (DestructuringPattern | null)[]
  optional: boolean
  type: AST_NODE_TYPES.ArrayPattern
  typeAnnotation: TSTypeAnnotation | undefined
}
export interface ArrowFunctionExpression extends BaseNode {
  async: boolean
  body: BlockStatement | Expression
  expression: boolean
  generator: boolean
  id: null
  params: Parameter[]
  returnType: TSTypeAnnotation | undefined
  type: AST_NODE_TYPES.ArrowFunctionExpression
  typeParameters: TSTypeParameterDeclaration | undefined
}
export interface AssignmentExpression extends BaseNode {
  left: Expression
  operator: ValueOf<AssignmentOperatorToText>
  right: Expression
  type: AST_NODE_TYPES.AssignmentExpression
}
export interface AssignmentOperatorToText {
  [SyntaxKind.AmpersandAmpersandEqualsToken]: '&&='
  [SyntaxKind.AmpersandEqualsToken]: '&='
  [SyntaxKind.AsteriskAsteriskEqualsToken]: '**='
  [SyntaxKind.AsteriskEqualsToken]: '*='
  [SyntaxKind.BarBarEqualsToken]: '||='
  [SyntaxKind.BarEqualsToken]: '|='
  [SyntaxKind.CaretEqualsToken]: '^='
  [SyntaxKind.EqualsToken]: '='
  [SyntaxKind.GreaterThanGreaterThanEqualsToken]: '>>='
  [SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken]: '>>>='
  [SyntaxKind.LessThanLessThanEqualsToken]: '<<='
  [SyntaxKind.MinusEqualsToken]: '-='
  [SyntaxKind.PercentEqualsToken]: '%='
  [SyntaxKind.PlusEqualsToken]: '+='
  [SyntaxKind.QuestionQuestionEqualsToken]: '??='
  [SyntaxKind.SlashEqualsToken]: '/='
}
export interface AssignmentPattern extends BaseNode {
  decorators: Decorator[]
  left: BindingName
  optional: boolean
  right: Expression
  type: AST_NODE_TYPES.AssignmentPattern
  typeAnnotation: TSTypeAnnotation | undefined
}
export enum AST_NODE_TYPES {
  AccessorProperty = 'AccessorProperty',
  ArrayExpression = 'ArrayExpression',
  ArrayPattern = 'ArrayPattern',
  ArrowFunctionExpression = 'ArrowFunctionExpression',
  AssignmentExpression = 'AssignmentExpression',
  AssignmentPattern = 'AssignmentPattern',
  AwaitExpression = 'AwaitExpression',
  BinaryExpression = 'BinaryExpression',
  BlockStatement = 'BlockStatement',
  BreakStatement = 'BreakStatement',
  CallExpression = 'CallExpression',
  CatchClause = 'CatchClause',
  ChainExpression = 'ChainExpression',
  ClassBody = 'ClassBody',
  ClassDeclaration = 'ClassDeclaration',
  ClassExpression = 'ClassExpression',
  ConditionalExpression = 'ConditionalExpression',
  ContinueStatement = 'ContinueStatement',
  DebuggerStatement = 'DebuggerStatement',
  Decorator = 'Decorator',
  DoWhileStatement = 'DoWhileStatement',
  EmptyStatement = 'EmptyStatement',
  ExportAllDeclaration = 'ExportAllDeclaration',
  ExportDefaultDeclaration = 'ExportDefaultDeclaration',
  ExportNamedDeclaration = 'ExportNamedDeclaration',
  ExportSpecifier = 'ExportSpecifier',
  ExpressionStatement = 'ExpressionStatement',
  ForInStatement = 'ForInStatement',
  ForOfStatement = 'ForOfStatement',
  ForStatement = 'ForStatement',
  FunctionDeclaration = 'FunctionDeclaration',
  FunctionExpression = 'FunctionExpression',
  Identifier = 'Identifier',
  IfStatement = 'IfStatement',
  ImportAttribute = 'ImportAttribute',
  ImportDeclaration = 'ImportDeclaration',
  ImportDefaultSpecifier = 'ImportDefaultSpecifier',
  ImportExpression = 'ImportExpression',
  ImportNamespaceSpecifier = 'ImportNamespaceSpecifier',
  ImportSpecifier = 'ImportSpecifier',
  JSXAttribute = 'JSXAttribute',
  JSXClosingElement = 'JSXClosingElement',
  JSXClosingFragment = 'JSXClosingFragment',
  JSXElement = 'JSXElement',
  JSXEmptyExpression = 'JSXEmptyExpression',
  JSXExpressionContainer = 'JSXExpressionContainer',
  JSXFragment = 'JSXFragment',
  JSXIdentifier = 'JSXIdentifier',
  JSXMemberExpression = 'JSXMemberExpression',
  JSXNamespacedName = 'JSXNamespacedName',
  JSXOpeningElement = 'JSXOpeningElement',
  JSXOpeningFragment = 'JSXOpeningFragment',
  JSXSpreadAttribute = 'JSXSpreadAttribute',
  JSXSpreadChild = 'JSXSpreadChild',
  JSXText = 'JSXText',
  LabeledStatement = 'LabeledStatement',
  Literal = 'Literal',
  LogicalExpression = 'LogicalExpression',
  MemberExpression = 'MemberExpression',
  MetaProperty = 'MetaProperty',
  MethodDefinition = 'MethodDefinition',
  NewExpression = 'NewExpression',
  ObjectExpression = 'ObjectExpression',
  ObjectPattern = 'ObjectPattern',
  PrivateIdentifier = 'PrivateIdentifier',
  Program = 'Program',
  Property = 'Property',
  PropertyDefinition = 'PropertyDefinition',
  RestElement = 'RestElement',
  ReturnStatement = 'ReturnStatement',
  SequenceExpression = 'SequenceExpression',
  SpreadElement = 'SpreadElement',
  StaticBlock = 'StaticBlock',
  Super = 'Super',
  SwitchCase = 'SwitchCase',
  SwitchStatement = 'SwitchStatement',
  TaggedTemplateExpression = 'TaggedTemplateExpression',
  TemplateElement = 'TemplateElement',
  TemplateLiteral = 'TemplateLiteral',
  ThisExpression = 'ThisExpression',
  ThrowStatement = 'ThrowStatement',
  TryStatement = 'TryStatement',
  UnaryExpression = 'UnaryExpression',
  UpdateExpression = 'UpdateExpression',
  VariableDeclaration = 'VariableDeclaration',
  VariableDeclarator = 'VariableDeclarator',
  WhileStatement = 'WhileStatement',
  WithStatement = 'WithStatement',
  YieldExpression = 'YieldExpression',
  TSAbstractAccessorProperty = 'TSAbstractAccessorProperty',
  TSAbstractKeyword = 'TSAbstractKeyword',
  TSAbstractMethodDefinition = 'TSAbstractMethodDefinition',
  TSAbstractPropertyDefinition = 'TSAbstractPropertyDefinition',
  TSAnyKeyword = 'TSAnyKeyword',
  TSArrayType = 'TSArrayType',
  TSAsExpression = 'TSAsExpression',
  TSAsyncKeyword = 'TSAsyncKeyword',
  TSBigIntKeyword = 'TSBigIntKeyword',
  TSBooleanKeyword = 'TSBooleanKeyword',
  TSCallSignatureDeclaration = 'TSCallSignatureDeclaration',
  TSClassImplements = 'TSClassImplements',
  TSConditionalType = 'TSConditionalType',
  TSConstructorType = 'TSConstructorType',
  TSConstructSignatureDeclaration = 'TSConstructSignatureDeclaration',
  TSDeclareFunction = 'TSDeclareFunction',
  TSDeclareKeyword = 'TSDeclareKeyword',
  TSEmptyBodyFunctionExpression = 'TSEmptyBodyFunctionExpression',
  TSEnumBody = 'TSEnumBody',
  TSEnumDeclaration = 'TSEnumDeclaration',
  TSEnumMember = 'TSEnumMember',
  TSExportAssignment = 'TSExportAssignment',
  TSExportKeyword = 'TSExportKeyword',
  TSExternalModuleReference = 'TSExternalModuleReference',
  TSFunctionType = 'TSFunctionType',
  TSImportEqualsDeclaration = 'TSImportEqualsDeclaration',
  TSImportType = 'TSImportType',
  TSIndexedAccessType = 'TSIndexedAccessType',
  TSIndexSignature = 'TSIndexSignature',
  TSInferType = 'TSInferType',
  TSInstantiationExpression = 'TSInstantiationExpression',
  TSInterfaceBody = 'TSInterfaceBody',
  TSInterfaceDeclaration = 'TSInterfaceDeclaration',
  TSInterfaceHeritage = 'TSInterfaceHeritage',
  TSIntersectionType = 'TSIntersectionType',
  TSIntrinsicKeyword = 'TSIntrinsicKeyword',
  TSLiteralType = 'TSLiteralType',
  TSMappedType = 'TSMappedType',
  TSMethodSignature = 'TSMethodSignature',
  TSModuleBlock = 'TSModuleBlock',
  TSModuleDeclaration = 'TSModuleDeclaration',
  TSNamedTupleMember = 'TSNamedTupleMember',
  TSNamespaceExportDeclaration = 'TSNamespaceExportDeclaration',
  TSNeverKeyword = 'TSNeverKeyword',
  TSNonNullExpression = 'TSNonNullExpression',
  TSNullKeyword = 'TSNullKeyword',
  TSNumberKeyword = 'TSNumberKeyword',
  TSObjectKeyword = 'TSObjectKeyword',
  TSOptionalType = 'TSOptionalType',
  TSParameterProperty = 'TSParameterProperty',
  TSPrivateKeyword = 'TSPrivateKeyword',
  TSPropertySignature = 'TSPropertySignature',
  TSProtectedKeyword = 'TSProtectedKeyword',
  TSPublicKeyword = 'TSPublicKeyword',
  TSQualifiedName = 'TSQualifiedName',
  TSReadonlyKeyword = 'TSReadonlyKeyword',
  TSRestType = 'TSRestType',
  TSSatisfiesExpression = 'TSSatisfiesExpression',
  TSStaticKeyword = 'TSStaticKeyword',
  TSStringKeyword = 'TSStringKeyword',
  TSSymbolKeyword = 'TSSymbolKeyword',
  TSTemplateLiteralType = 'TSTemplateLiteralType',
  TSThisType = 'TSThisType',
  TSTupleType = 'TSTupleType',
  TSTypeAliasDeclaration = 'TSTypeAliasDeclaration',
  TSTypeAnnotation = 'TSTypeAnnotation',
  TSTypeAssertion = 'TSTypeAssertion',
  TSTypeLiteral = 'TSTypeLiteral',
  TSTypeOperator = 'TSTypeOperator',
  TSTypeParameter = 'TSTypeParameter',
  TSTypeParameterDeclaration = 'TSTypeParameterDeclaration',
  TSTypeParameterInstantiation = 'TSTypeParameterInstantiation',
  TSTypePredicate = 'TSTypePredicate',
  TSTypeQuery = 'TSTypeQuery',
  TSTypeReference = 'TSTypeReference',
  TSUndefinedKeyword = 'TSUndefinedKeyword',
  TSUnionType = 'TSUnionType',
  TSUnknownKeyword = 'TSUnknownKeyword',
  TSVoidKeyword = 'TSVoidKeyword',
}
export enum AST_TOKEN_TYPES {
  Boolean = 'Boolean',
  Identifier = 'Identifier',
  JSXIdentifier = 'JSXIdentifier',
  JSXText = 'JSXText',
  Keyword = 'Keyword',
  Null = 'Null',
  Numeric = 'Numeric',
  Punctuator = 'Punctuator',
  RegularExpression = 'RegularExpression',
  String = 'String',
  Template = 'Template',
  Block = 'Block',
  Line = 'Line',
}
export interface AwaitExpression extends BaseNode {
  argument: Expression
  type: AST_NODE_TYPES.AwaitExpression
}
export interface BaseNode extends NodeOrTokenData {
  type: AST_NODE_TYPES
}
declare interface BaseToken extends NodeOrTokenData {
  type: AST_TOKEN_TYPES
  value: string
}
export interface BigIntLiteral extends LiteralBase {
  bigint: string
  value: bigint | null
}
export interface BinaryExpression extends BaseNode {
  left: Expression | PrivateIdentifier
  operator: ValueOf<BinaryOperatorToText>
  right: Expression
  type: AST_NODE_TYPES.BinaryExpression
}
export interface BinaryOperatorToText {
  [SyntaxKind.AmpersandAmpersandToken]: '&&'
  [SyntaxKind.AmpersandToken]: '&'
  [SyntaxKind.AsteriskAsteriskToken]: '**'
  [SyntaxKind.AsteriskToken]: '*'
  [SyntaxKind.BarBarToken]: '||'
  [SyntaxKind.BarToken]: '|'
  [SyntaxKind.CaretToken]: '^'
  [SyntaxKind.EqualsEqualsEqualsToken]: '==='
  [SyntaxKind.EqualsEqualsToken]: '=='
  [SyntaxKind.ExclamationEqualsEqualsToken]: '!=='
  [SyntaxKind.ExclamationEqualsToken]: '!='
  [SyntaxKind.GreaterThanEqualsToken]: '>='
  [SyntaxKind.GreaterThanGreaterThanGreaterThanToken]: '>>>'
  [SyntaxKind.GreaterThanGreaterThanToken]: '>>'
  [SyntaxKind.GreaterThanToken]: '>'
  [SyntaxKind.InKeyword]: 'in'
  [SyntaxKind.InstanceOfKeyword]: 'instanceof'
  [SyntaxKind.LessThanEqualsToken]: '<='
  [SyntaxKind.LessThanLessThanToken]: '<<'
  [SyntaxKind.LessThanToken]: '<'
  [SyntaxKind.MinusToken]: '-'
  [SyntaxKind.PercentToken]: '%'
  [SyntaxKind.PlusToken]: '+'
  [SyntaxKind.SlashToken]: '/'
}
export type BindingName = BindingPattern | Identifier
export type BindingPattern = ArrayPattern | ObjectPattern
export interface BlockComment extends BaseToken {
  type: AST_TOKEN_TYPES.Block
}
export interface BlockStatement extends BaseNode {
  body: Statement[]
  type: AST_NODE_TYPES.BlockStatement
}
export interface BooleanLiteral extends LiteralBase {
  raw: 'false' | 'true'
  value: boolean
}
export interface BooleanToken extends BaseToken {
  type: AST_TOKEN_TYPES.Boolean
}
export interface BreakStatement extends BaseNode {
  label: Identifier | null
  type: AST_NODE_TYPES.BreakStatement
}
export interface CallExpression extends BaseNode {
  arguments: CallExpressionArgument[]
  callee: Expression
  optional: boolean
  type: AST_NODE_TYPES.CallExpression
  typeArguments: TSTypeParameterInstantiation | undefined
}
export type CallExpressionArgument = Expression | SpreadElement
export interface CatchClause extends BaseNode {
  body: BlockStatement
  param: BindingName | null
  type: AST_NODE_TYPES.CatchClause
}
export type ChainElement =
  | CallExpression
  | MemberExpression
  | TSNonNullExpression
export interface ChainExpression extends BaseNode {
  expression: ChainElement
  type: AST_NODE_TYPES.ChainExpression
}
declare interface ClassBase extends BaseNode {
  /**
   * Whether the class is an abstract class.
   * @example
   * ```ts
   * abstract class Foo {}
   * ```
   */
  abstract: boolean
  /**
   * The class body.
   */
  body: ClassBody
  /**
   * Whether the class has been `declare`d:
   * @example
   * ```ts
   * declare class Foo {}
   * ```
   */
  declare: boolean
  /**
   * The decorators declared for the class.
   * @example
   * ```ts
   * @deco
   * class Foo {}
   * ```
   */
  decorators: Decorator[]
  /**
   * The class's name.
   * - For a `ClassExpression` this may be `null` if the name is omitted.
   * - For a `ClassDeclaration` this may be `null` if and only if the parent is
   *   an `ExportDefaultDeclaration`.
   */
  id: Identifier | null
  /**
   * The implemented interfaces for the class.
   */
  implements: TSClassImplements[]
  /**
   * The super class this class extends.
   */
  superClass: LeftHandSideExpression | null
  /**
   * The generic type parameters passed to the superClass.
   */
  superTypeArguments: TSTypeParameterInstantiation | undefined
  /**
   * The generic type parameters declared for the class.
   */
  typeParameters: TSTypeParameterDeclaration | undefined
}
export interface ClassBody extends BaseNode {
  body: ClassElement[]
  type: AST_NODE_TYPES.ClassBody
}
export type ClassDeclaration =
  | ClassDeclarationWithName
  | ClassDeclarationWithOptionalName
declare interface ClassDeclarationBase extends ClassBase {
  type: AST_NODE_TYPES.ClassDeclaration
}
/**
 * A normal class declaration:
 * ```
 * class A {}
 * ```
 */
export interface ClassDeclarationWithName extends ClassDeclarationBase {
  id: Identifier
}
/**
 * Default-exported class declarations have optional names:
 * ```
 * export default class {}
 * ```
 */
export interface ClassDeclarationWithOptionalName extends ClassDeclarationBase {
  id: Identifier | null
}
export type ClassElement =
  | AccessorProperty
  | MethodDefinition
  | PropertyDefinition
  | StaticBlock
  | TSAbstractAccessorProperty
  | TSAbstractMethodDefinition
  | TSAbstractPropertyDefinition
  | TSIndexSignature
export interface ClassExpression extends ClassBase {
  abstract: false
  declare: false
  type: AST_NODE_TYPES.ClassExpression
}
declare interface ClassMethodDefinitionNonComputedNameBase
  extends MethodDefinitionBase {
  computed: false
  key: ClassPropertyNameNonComputed
}
declare interface ClassPropertyDefinitionNonComputedNameBase
  extends PropertyDefinitionBase {
  computed: false
  key: ClassPropertyNameNonComputed
}
export type ClassPropertyNameNonComputed =
  | PrivateIdentifier
  | PropertyNameNonComputed
export type Comment = BlockComment | LineComment
export interface ConditionalExpression extends BaseNode {
  alternate: Expression
  consequent: Expression
  test: Expression
  type: AST_NODE_TYPES.ConditionalExpression
}
export interface ConstDeclaration extends LetOrConstOrVarDeclarationBase {
  /**
   * In a `declare const` declaration, the declarators may have initializers, but
   * not definite assignment assertions. Each declarator cannot have both an
   * initializer and a type annotation.
   *
   * Even if the declaration has no `declare`, it may still be ambient and have
   * no initializer.
   */
  declarations: VariableDeclaratorMaybeInit[]
  kind: 'const'
}
export interface ContinueStatement extends BaseNode {
  label: Identifier | null
  type: AST_NODE_TYPES.ContinueStatement
}
export interface DebuggerStatement extends BaseNode {
  type: AST_NODE_TYPES.DebuggerStatement
}
/**
 * @deprecated
 * Note that this is neither up to date nor fully correct.
 */
export type DeclarationStatement =
  | ClassDeclaration
  | ClassExpression
  | ExportAllDeclaration
  | ExportDefaultDeclaration
  | ExportNamedDeclaration
  | FunctionDeclaration
  | TSDeclareFunction
  | TSEnumDeclaration
  | TSImportEqualsDeclaration
  | TSInterfaceDeclaration
  | TSModuleDeclaration
  | TSNamespaceExportDeclaration
  | TSTypeAliasDeclaration
export interface Decorator extends BaseNode {
  expression: LeftHandSideExpression
  type: AST_NODE_TYPES.Decorator
}
export type DefaultExportDeclarations =
  | ClassDeclarationWithOptionalName
  | Expression
  | FunctionDeclarationWithName
  | FunctionDeclarationWithOptionalName
  | TSDeclareFunction
  | TSEnumDeclaration
  | TSInterfaceDeclaration
  | TSModuleDeclaration
  | TSTypeAliasDeclaration
  | VariableDeclaration
export type DestructuringPattern =
  | ArrayPattern
  | AssignmentPattern
  | Identifier
  | MemberExpression
  | ObjectPattern
  | RestElement
export interface DoWhileStatement extends BaseNode {
  body: Statement
  test: Expression
  type: AST_NODE_TYPES.DoWhileStatement
}
export interface EmptyStatement extends BaseNode {
  type: AST_NODE_TYPES.EmptyStatement
}
export type EntityName = Identifier | ThisExpression | TSQualifiedName
export interface ExportAllDeclaration extends BaseNode {
  /**
   * The assertions declared for the export.
   * @example
   * ```ts
   * export * from 'mod' assert \{ type: 'json' \};
   * ```
   * @deprecated Replaced with {@link `attributes`}.
   */
  assertions: ImportAttribute[]
  /**
   * The attributes declared for the export.
   * @example
   * ```ts
   * export * from 'mod' with \{ type: 'json' \};
   * ```
   */
  attributes: ImportAttribute[]
  /**
   * The name for the exported items (`as X`). `null` if no name is assigned.
   */
  exported: Identifier | null
  /**
   * The kind of the export.
   */
  exportKind: ExportKind
  /**
   * The source module being exported from.
   */
  source: StringLiteral
  type: AST_NODE_TYPES.ExportAllDeclaration
}
declare type ExportAndImportKind = 'type' | 'value'
export type ExportDeclaration =
  | DefaultExportDeclarations
  | NamedExportDeclarations
export interface ExportDefaultDeclaration extends BaseNode {
  /**
   * The declaration being exported.
   */
  declaration: DefaultExportDeclarations
  /**
   * The kind of the export. Always `value` for default exports.
   */
  exportKind: 'value'
  type: AST_NODE_TYPES.ExportDefaultDeclaration
}
declare type ExportKind = ExportAndImportKind
export type ExportNamedDeclaration =
  | ExportNamedDeclarationWithoutSourceWithMultiple
  | ExportNamedDeclarationWithoutSourceWithSingle
  | ExportNamedDeclarationWithSource
declare interface ExportNamedDeclarationBase extends BaseNode {
  /**
   * The assertions declared for the export.
   * @example
   * ```ts
   * export { foo } from 'mod' assert \{ type: 'json' \};
   * ```
   * This will be an empty array if `source` is `null`
   * @deprecated Replaced with {@link `attributes`}.
   */
  assertions: ImportAttribute[]
  /**
   * The attributes declared for the export.
   * @example
   * ```ts
   * export { foo } from 'mod' with \{ type: 'json' \};
   * ```
   * This will be an empty array if `source` is `null`
   */
  attributes: ImportAttribute[]
  /**
   * The exported declaration.
   * @example
   * ```ts
   * export const x = 1;
   * ```
   * This will be `null` if `source` is not `null`, or if there are `specifiers`
   */
  declaration: NamedExportDeclarations | null
  /**
   * The kind of the export.
   */
  exportKind: ExportKind
  /**
   * The source module being exported from.
   */
  source: StringLiteral | null
  /**
   * The specifiers being exported.
   * @example
   * ```ts
   * export { a, b };
   * ```
   * This will be an empty array if `declaration` is not `null`
   */
  specifiers: ExportSpecifier[]
  type: AST_NODE_TYPES.ExportNamedDeclaration
}
/**
 * Exporting names from the current module.
 * ```
 * export {};
 * export { a, b };
 * ```
 */
export interface ExportNamedDeclarationWithoutSourceWithMultiple
  extends ExportNamedDeclarationBase {
  /**
   * This will always be an empty array.
   * @deprecated Replaced with {@link `attributes`}.
   */
  assertions: ImportAttribute[]
  /**
   * This will always be an empty array.
   */
  attributes: ImportAttribute[]
  declaration: null
  source: null
}
/**
 * Exporting a single named declaration.
 * ```
 * export const x = 1;
 * ```
 */
export interface ExportNamedDeclarationWithoutSourceWithSingle
  extends ExportNamedDeclarationBase {
  /**
   * This will always be an empty array.
   * @deprecated Replaced with {@link `attributes`}.
   */
  assertions: ImportAttribute[]
  /**
   * This will always be an empty array.
   */
  attributes: ImportAttribute[]
  declaration: NamedExportDeclarations
  source: null
  /**
   * This will always be an empty array.
   */
  specifiers: ExportSpecifier[]
}
/**
 * Export names from another module.
 * ```
 * export { a, b } from 'mod';
 * ```
 */
export interface ExportNamedDeclarationWithSource
  extends ExportNamedDeclarationBase {
  declaration: null
  source: StringLiteral
}
export interface ExportSpecifier extends BaseNode {
  exported: Identifier
  exportKind: ExportKind
  local: Identifier
  type: AST_NODE_TYPES.ExportSpecifier
}
export type Expression =
  | ArrayExpression
  | ArrayPattern
  | ArrowFunctionExpression
  | AssignmentExpression
  | AwaitExpression
  | BinaryExpression
  | CallExpression
  | ChainExpression
  | ClassExpression
  | ConditionalExpression
  | FunctionExpression
  | Identifier
  | ImportExpression
  | JSXElement
  | JSXFragment
  | LiteralExpression
  | LogicalExpression
  | MemberExpression
  | MetaProperty
  | NewExpression
  | ObjectExpression
  | ObjectPattern
  | SequenceExpression
  | Super
  | TaggedTemplateExpression
  | TemplateLiteral
  | ThisExpression
  | TSAsExpression
  | TSInstantiationExpression
  | TSNonNullExpression
  | TSSatisfiesExpression
  | TSTypeAssertion
  | UnaryExpression
  | UpdateExpression
  | YieldExpression
export interface ExpressionStatement extends BaseNode {
  directive: string | undefined
  expression: Expression
  type: AST_NODE_TYPES.ExpressionStatement
}
export type ForInitialiser = Expression | LetOrConstOrVarDeclaration
export interface ForInStatement extends BaseNode {
  body: Statement
  left: ForInitialiser
  right: Expression
  type: AST_NODE_TYPES.ForInStatement
}
declare type ForOfInitialiser =
  | Expression
  | LetOrConstOrVarDeclaration
  | UsingInForOfDeclaration
export interface ForOfStatement extends BaseNode {
  await: boolean
  body: Statement
  left: ForOfInitialiser
  right: Expression
  type: AST_NODE_TYPES.ForOfStatement
}
export interface ForStatement extends BaseNode {
  body: Statement
  init: Expression | ForInitialiser | null
  test: Expression | null
  type: AST_NODE_TYPES.ForStatement
  update: Expression | null
}
declare interface FunctionBase extends BaseNode {
  /**
   * Whether the function is async:
   * ```
   * async function foo() {}
   * const x = async function () {}
   * const x = async () => {}
   * ```
   */
  async: boolean
  /**
   * The body of the function.
   * - For an `ArrowFunctionExpression` this may be an `Expression` or `BlockStatement`.
   * - For a `FunctionDeclaration` or `FunctionExpression` this is always a `BlockStatement`.
   * - For a `TSDeclareFunction` this is always `undefined`.
   * - For a `TSEmptyBodyFunctionExpression` this is always `null`.
   */
  body: BlockStatement | Expression | null | undefined
  /**
   * This is only `true` if and only if the node is a `TSDeclareFunction` and it has `declare`:
   * ```
   * declare function foo() {}
   * ```
   */
  declare: boolean
  /**
   * This is only ever `true` if and only the node is an `ArrowFunctionExpression` and the body
   * is an expression:
   * ```
   * (() => 1)
   * ```
   */
  expression: boolean
  /**
   * Whether the function is a generator function:
   * ```
   * function *foo() {}
   * const x = function *() {}
   * ```
   * This is always `false` for arrow functions as they cannot be generators.
   */
  generator: boolean
  /**
   * The function's name.
   * - For an `ArrowFunctionExpression` this is always `null`.
   * - For a `FunctionExpression` this may be `null` if the name is omitted.
   * - For a `FunctionDeclaration` or `TSDeclareFunction` this may be `null` if
   *   and only if the parent is an `ExportDefaultDeclaration`.
   */
  id: Identifier | null
  /**
   * The list of parameters declared for the function.
   */
  params: Parameter[]
  /**
   * The return type annotation for the function.
   */
  returnType: TSTypeAnnotation | undefined
  /**
   * The generic type parameter declaration for the function.
   */
  typeParameters: TSTypeParameterDeclaration | undefined
}
export type FunctionDeclaration =
  | FunctionDeclarationWithName
  | FunctionDeclarationWithOptionalName
declare interface FunctionDeclarationBase extends FunctionBase {
  body: BlockStatement
  declare: false
  expression: false
  type: AST_NODE_TYPES.FunctionDeclaration
}
/**
 * A normal function declaration:
 * ```
 * function f() {}
 * ```
 */
export interface FunctionDeclarationWithName extends FunctionDeclarationBase {
  id: Identifier
}
/**
 * Default-exported function declarations have optional names:
 * ```
 * export default function () {}
 * ```
 */
export interface FunctionDeclarationWithOptionalName
  extends FunctionDeclarationBase {
  id: Identifier | null
}
export interface FunctionExpression extends FunctionBase {
  body: BlockStatement
  expression: false
  type: AST_NODE_TYPES.FunctionExpression
}
export type FunctionLike =
  | ArrowFunctionExpression
  | FunctionDeclaration
  | FunctionExpression
  | TSDeclareFunction
  | TSEmptyBodyFunctionExpression
export interface Identifier extends BaseNode {
  decorators: Decorator[]
  name: string
  optional: boolean
  type: AST_NODE_TYPES.Identifier
  typeAnnotation: TSTypeAnnotation | undefined
}
export interface IdentifierToken extends BaseToken {
  type: AST_TOKEN_TYPES.Identifier
}
export interface IfStatement extends BaseNode {
  alternate: Statement | null
  consequent: Statement
  test: Expression
  type: AST_NODE_TYPES.IfStatement
}
export interface ImportAttribute extends BaseNode {
  key: Identifier | Literal
  type: AST_NODE_TYPES.ImportAttribute
  value: Literal
}
export type ImportClause =
  | ImportDefaultSpecifier
  | ImportNamespaceSpecifier
  | ImportSpecifier
export interface ImportDeclaration extends BaseNode {
  /**
   * The assertions declared for the export.
   * @example
   * ```ts
   * import * from 'mod' assert \{ type: 'json' \};
   * ```
   * @deprecated Replaced with {@link `attributes`}.
   */
  assertions: ImportAttribute[]
  /**
   * The attributes declared for the export.
   * @example
   * ```ts
   * import * from 'mod' with \{ type: 'json' \};
   * ```
   */
  attributes: ImportAttribute[]
  /**
   * The kind of the import.
   */
  importKind: ImportKind
  /**
   * The source module being imported from.
   */
  source: StringLiteral
  /**
   * The specifiers being imported.
   * If this is an empty array then either there are no specifiers:
   * ```
   * import {} from 'mod';
   * ```
   * Or it is a side-effect import:
   * ```
   * import 'mod';
   * ```
   */
  specifiers: ImportClause[]
  type: AST_NODE_TYPES.ImportDeclaration
}
export interface ImportDefaultSpecifier extends BaseNode {
  local: Identifier
  type: AST_NODE_TYPES.ImportDefaultSpecifier
}
export interface ImportExpression extends BaseNode {
  attributes: Expression | null
  source: Expression
  type: AST_NODE_TYPES.ImportExpression
}
declare type ImportKind = ExportAndImportKind
export interface ImportNamespaceSpecifier extends BaseNode {
  local: Identifier
  type: AST_NODE_TYPES.ImportNamespaceSpecifier
}
export interface ImportSpecifier extends BaseNode {
  imported: Identifier
  importKind: ImportKind
  local: Identifier
  type: AST_NODE_TYPES.ImportSpecifier
}
export type IterationStatement =
  | DoWhileStatement
  | ForInStatement
  | ForOfStatement
  | ForStatement
  | WhileStatement
export interface JSXAttribute extends BaseNode {
  name: JSXIdentifier | JSXNamespacedName
  type: AST_NODE_TYPES.JSXAttribute
  value: JSXElement | JSXExpression | Literal | null
}
export type JSXChild = JSXElement | JSXExpression | JSXFragment | JSXText
export interface JSXClosingElement extends BaseNode {
  name: JSXTagNameExpression
  type: AST_NODE_TYPES.JSXClosingElement
}
export interface JSXClosingFragment extends BaseNode {
  type: AST_NODE_TYPES.JSXClosingFragment
}
export interface JSXElement extends BaseNode {
  children: JSXChild[]
  closingElement: JSXClosingElement | null
  openingElement: JSXOpeningElement
  type: AST_NODE_TYPES.JSXElement
}
export interface JSXEmptyExpression extends BaseNode {
  type: AST_NODE_TYPES.JSXEmptyExpression
}
export type JSXExpression = JSXExpressionContainer | JSXSpreadChild
export interface JSXExpressionContainer extends BaseNode {
  expression: Expression | JSXEmptyExpression
  type: AST_NODE_TYPES.JSXExpressionContainer
}
export interface JSXFragment extends BaseNode {
  children: JSXChild[]
  closingFragment: JSXClosingFragment
  openingFragment: JSXOpeningFragment
  type: AST_NODE_TYPES.JSXFragment
}
export interface JSXIdentifier extends BaseNode {
  name: string
  type: AST_NODE_TYPES.JSXIdentifier
}
export interface JSXIdentifierToken extends BaseToken {
  type: AST_TOKEN_TYPES.JSXIdentifier
}
export interface JSXMemberExpression extends BaseNode {
  object: JSXTagNameExpression
  property: JSXIdentifier
  type: AST_NODE_TYPES.JSXMemberExpression
}
export interface JSXNamespacedName extends BaseNode {
  name: JSXIdentifier
  namespace: JSXIdentifier
  type: AST_NODE_TYPES.JSXNamespacedName
}
export interface JSXOpeningElement extends BaseNode {
  attributes: (JSXAttribute | JSXSpreadAttribute)[]
  name: JSXTagNameExpression
  selfClosing: boolean
  type: AST_NODE_TYPES.JSXOpeningElement
  typeArguments: TSTypeParameterInstantiation | undefined
}
export interface JSXOpeningFragment extends BaseNode {
  type: AST_NODE_TYPES.JSXOpeningFragment
}
export interface JSXSpreadAttribute extends BaseNode {
  argument: Expression
  type: AST_NODE_TYPES.JSXSpreadAttribute
}
export interface JSXSpreadChild extends BaseNode {
  expression: Expression | JSXEmptyExpression
  type: AST_NODE_TYPES.JSXSpreadChild
}
export type JSXTagNameExpression =
  | JSXIdentifier
  | JSXMemberExpression
  | JSXNamespacedName
export interface JSXText extends BaseNode {
  raw: string
  type: AST_NODE_TYPES.JSXText
  value: string
}
export interface JSXTextToken extends BaseToken {
  type: AST_TOKEN_TYPES.JSXText
}
export interface KeywordToken extends BaseToken {
  type: AST_TOKEN_TYPES.Keyword
}
export interface LabeledStatement extends BaseNode {
  body: Statement
  label: Identifier
  type: AST_NODE_TYPES.LabeledStatement
}
export type LeftHandSideExpression =
  | ArrayExpression
  | ArrayPattern
  | ArrowFunctionExpression
  | CallExpression
  | ClassExpression
  | FunctionExpression
  | Identifier
  | JSXElement
  | JSXFragment
  | LiteralExpression
  | MemberExpression
  | MetaProperty
  | ObjectExpression
  | ObjectPattern
  | SequenceExpression
  | Super
  | TaggedTemplateExpression
  | ThisExpression
  | TSAsExpression
  | TSNonNullExpression
  | TSTypeAssertion
export type LetOrConstOrVarDeclaration =
  | ConstDeclaration
  | LetOrVarDeclaredDeclaration
  | LetOrVarNonDeclaredDeclaration
declare interface LetOrConstOrVarDeclarationBase extends BaseNode {
  /**
   * The variables declared by this declaration.
   * Always non-empty.
   * @example
   * ```ts
   * let x;
   * let y, z;
   * ```
   */
  declarations: LetOrConstOrVarDeclarator[]
  /**
   * Whether the declaration is `declare`d
   * @example
   * ```ts
   * declare const x = 1;
   * ```
   */
  declare: boolean
  /**
   * The keyword used to declare the variable(s)
   * @example
   * ```ts
   * const x = 1;
   * let y = 2;
   * var z = 3;
   * ```
   */
  kind: 'const' | 'let' | 'var'
  type: AST_NODE_TYPES.VariableDeclaration
}
export type LetOrConstOrVarDeclarator =
  | VariableDeclaratorDefiniteAssignment
  | VariableDeclaratorMaybeInit
  | VariableDeclaratorNoInit
export interface LetOrVarDeclaredDeclaration
  extends LetOrConstOrVarDeclarationBase {
  /**
   * In a `declare let` declaration, the declarators must not have definite assignment
   * assertions or initializers.
   *
   * @example
   * ```ts
   * using x = 1;
   * using y =1, z = 2;
   * ```
   */
  declarations: VariableDeclaratorNoInit[]
  declare: true
  kind: 'let' | 'var'
}
export interface LetOrVarNonDeclaredDeclaration
  extends LetOrConstOrVarDeclarationBase {
  /**
   * In a `let`/`var` declaration, the declarators may have definite assignment
   * assertions or initializers, but not both.
   */
  declarations: (
    | VariableDeclaratorDefiniteAssignment
    | VariableDeclaratorMaybeInit
  )[]
  declare: false
  kind: 'let' | 'var'
}
export interface LineComment extends BaseToken {
  type: AST_TOKEN_TYPES.Line
}
export type Literal =
  | BigIntLiteral
  | BooleanLiteral
  | NullLiteral
  | NumberLiteral
  | RegExpLiteral
  | StringLiteral
declare interface LiteralBase extends BaseNode {
  raw: string
  type: AST_NODE_TYPES.Literal
  value: RegExp | bigint | boolean | number | string | null
}
export type LiteralExpression = Literal | TemplateLiteral
export interface LogicalExpression extends BaseNode {
  left: Expression
  operator: '&&' | '??' | '||'
  right: Expression
  type: AST_NODE_TYPES.LogicalExpression
}
export type MemberExpression =
  | MemberExpressionComputedName
  | MemberExpressionNonComputedName
declare interface MemberExpressionBase extends BaseNode {
  computed: boolean
  object: Expression
  optional: boolean
  property: Expression | Identifier | PrivateIdentifier
}
export interface MemberExpressionComputedName extends MemberExpressionBase {
  computed: true
  property: Expression
  type: AST_NODE_TYPES.MemberExpression
}
export interface MemberExpressionNonComputedName extends MemberExpressionBase {
  computed: false
  property: Identifier | PrivateIdentifier
  type: AST_NODE_TYPES.MemberExpression
}
export interface MetaProperty extends BaseNode {
  meta: Identifier
  property: Identifier
  type: AST_NODE_TYPES.MetaProperty
}
export type MethodDefinition =
  | MethodDefinitionComputedName
  | MethodDefinitionNonComputedName
/** this should not be directly used - instead use MethodDefinitionComputedNameBase or MethodDefinitionNonComputedNameBase */
declare interface MethodDefinitionBase extends BaseNode {
  accessibility: Accessibility | undefined
  computed: boolean
  decorators: Decorator[]
  key: PropertyName
  kind: 'constructor' | 'get' | 'method' | 'set'
  optional: boolean
  override: boolean
  static: boolean
  value: FunctionExpression | TSEmptyBodyFunctionExpression
}
export interface MethodDefinitionComputedName
  extends MethodDefinitionComputedNameBase {
  type: AST_NODE_TYPES.MethodDefinition
}
declare interface MethodDefinitionComputedNameBase
  extends MethodDefinitionBase {
  computed: true
  key: PropertyNameComputed
}
export interface MethodDefinitionNonComputedName
  extends ClassMethodDefinitionNonComputedNameBase {
  type: AST_NODE_TYPES.MethodDefinition
}
declare interface MethodDefinitionNonComputedNameBase
  extends MethodDefinitionBase {
  computed: false
  key: PropertyNameNonComputed
}
export type NamedExportDeclarations =
  | ClassDeclarationWithName
  | ClassDeclarationWithOptionalName
  | FunctionDeclarationWithName
  | FunctionDeclarationWithOptionalName
  | TSDeclareFunction
  | TSEnumDeclaration
  | TSImportEqualsDeclaration
  | TSInterfaceDeclaration
  | TSModuleDeclaration
  | TSTypeAliasDeclaration
  | VariableDeclaration
export interface NewExpression extends BaseNode {
  arguments: CallExpressionArgument[]
  callee: Expression
  type: AST_NODE_TYPES.NewExpression
  typeArguments: TSTypeParameterInstantiation | undefined
}
export type Node =
  | AccessorProperty
  | ArrayExpression
  | ArrayPattern
  | ArrowFunctionExpression
  | AssignmentExpression
  | AssignmentPattern
  | AwaitExpression
  | BinaryExpression
  | BlockStatement
  | BreakStatement
  | CallExpression
  | CatchClause
  | ChainExpression
  | ClassBody
  | ClassDeclaration
  | ClassExpression
  | ConditionalExpression
  | ContinueStatement
  | DebuggerStatement
  | Decorator
  | DoWhileStatement
  | EmptyStatement
  | ExportAllDeclaration
  | ExportDefaultDeclaration
  | ExportNamedDeclaration
  | ExportSpecifier
  | ExpressionStatement
  | ForInStatement
  | ForOfStatement
  | ForStatement
  | FunctionDeclaration
  | FunctionExpression
  | Identifier
  | IfStatement
  | ImportAttribute
  | ImportDeclaration
  | ImportDefaultSpecifier
  | ImportExpression
  | ImportNamespaceSpecifier
  | ImportSpecifier
  | JSXAttribute
  | JSXClosingElement
  | JSXClosingFragment
  | JSXElement
  | JSXEmptyExpression
  | JSXExpressionContainer
  | JSXFragment
  | JSXIdentifier
  | JSXMemberExpression
  | JSXNamespacedName
  | JSXOpeningElement
  | JSXOpeningFragment
  | JSXSpreadAttribute
  | JSXSpreadChild
  | JSXText
  | LabeledStatement
  | Literal
  | LogicalExpression
  | MemberExpression
  | MetaProperty
  | MethodDefinition
  | NewExpression
  | ObjectExpression
  | ObjectPattern
  | PrivateIdentifier
  | Program
  | Property
  | PropertyDefinition
  | RestElement
  | ReturnStatement
  | SequenceExpression
  | SpreadElement
  | StaticBlock
  | Super
  | SwitchCase
  | SwitchStatement
  | TaggedTemplateExpression
  | TemplateElement
  | TemplateLiteral
  | ThisExpression
  | ThrowStatement
  | TryStatement
  | TSAbstractAccessorProperty
  | TSAbstractKeyword
  | TSAbstractMethodDefinition
  | TSAbstractPropertyDefinition
  | TSAnyKeyword
  | TSArrayType
  | TSAsExpression
  | TSAsyncKeyword
  | TSBigIntKeyword
  | TSBooleanKeyword
  | TSCallSignatureDeclaration
  | TSClassImplements
  | TSConditionalType
  | TSConstructorType
  | TSConstructSignatureDeclaration
  | TSDeclareFunction
  | TSDeclareKeyword
  | TSEmptyBodyFunctionExpression
  | TSEnumBody
  | TSEnumDeclaration
  | TSEnumMember
  | TSExportAssignment
  | TSExportKeyword
  | TSExternalModuleReference
  | TSFunctionType
  | TSImportEqualsDeclaration
  | TSImportType
  | TSIndexedAccessType
  | TSIndexSignature
  | TSInferType
  | TSInstantiationExpression
  | TSInterfaceBody
  | TSInterfaceDeclaration
  | TSInterfaceHeritage
  | TSIntersectionType
  | TSIntrinsicKeyword
  | TSLiteralType
  | TSMappedType
  | TSMethodSignature
  | TSModuleBlock
  | TSModuleDeclaration
  | TSNamedTupleMember
  | TSNamespaceExportDeclaration
  | TSNeverKeyword
  | TSNonNullExpression
  | TSNullKeyword
  | TSNumberKeyword
  | TSObjectKeyword
  | TSOptionalType
  | TSParameterProperty
  | TSPrivateKeyword
  | TSPropertySignature
  | TSProtectedKeyword
  | TSPublicKeyword
  | TSQualifiedName
  | TSReadonlyKeyword
  | TSRestType
  | TSSatisfiesExpression
  | TSStaticKeyword
  | TSStringKeyword
  | TSSymbolKeyword
  | TSTemplateLiteralType
  | TSThisType
  | TSTupleType
  | TSTypeAliasDeclaration
  | TSTypeAnnotation
  | TSTypeAssertion
  | TSTypeLiteral
  | TSTypeOperator
  | TSTypeParameter
  | TSTypeParameterDeclaration
  | TSTypeParameterInstantiation
  | TSTypePredicate
  | TSTypeQuery
  | TSTypeReference
  | TSUndefinedKeyword
  | TSUnionType
  | TSUnknownKeyword
  | TSVoidKeyword
  | UnaryExpression
  | UpdateExpression
  | VariableDeclaration
  | VariableDeclarator
  | WhileStatement
  | WithStatement
  | YieldExpression
export interface NodeOrTokenData {
  /**
   * The source location information of the node.
   *
   * The loc property is defined as nullable by ESTree, but ESLint requires this property.
   */
  loc: SourceLocation
  range: Range
  type: string
}
export interface NullLiteral extends LiteralBase {
  raw: 'null'
  value: null
}
export interface NullToken extends BaseToken {
  type: AST_TOKEN_TYPES.Null
}
export interface NumberLiteral extends LiteralBase {
  value: number
}
export interface NumericToken extends BaseToken {
  type: AST_TOKEN_TYPES.Numeric
}
export interface ObjectExpression extends BaseNode {
  properties: ObjectLiteralElement[]
  type: AST_NODE_TYPES.ObjectExpression
}
export type ObjectLiteralElement = Property | SpreadElement
export type ObjectLiteralElementLike = ObjectLiteralElement
export interface ObjectPattern extends BaseNode {
  decorators: Decorator[]
  optional: boolean
  properties: (Property | RestElement)[]
  type: AST_NODE_TYPES.ObjectPattern
  typeAnnotation: TSTypeAnnotation | undefined
}
export type OptionalRangeAndLoc<T> = {
  loc?: SourceLocation
  range?: Range
} & Pick<T, Exclude<keyof T, 'loc' | 'range'>>
export type Parameter =
  | ArrayPattern
  | AssignmentPattern
  | Identifier
  | ObjectPattern
  | RestElement
  | TSParameterProperty
export interface Position {
  /**
   * Column number on the line (0-indexed)
   */
  column: number
  /**
   * Line number (1-indexed)
   */
  line: number
}
export type PrimaryExpression =
  | ArrayExpression
  | ArrayPattern
  | ClassExpression
  | FunctionExpression
  | Identifier
  | JSXElement
  | JSXFragment
  | JSXOpeningElement
  | LiteralExpression
  | MetaProperty
  | ObjectExpression
  | ObjectPattern
  | Super
  | TemplateLiteral
  | ThisExpression
  | TSNullKeyword
export interface PrivateIdentifier extends BaseNode {
  name: string
  type: AST_NODE_TYPES.PrivateIdentifier
}
export interface Program extends NodeOrTokenData {
  body: ProgramStatement[]
  comments: Comment[] | undefined
  sourceType: 'module' | 'script'
  tokens: Token[] | undefined
  type: AST_NODE_TYPES.Program
}
export type ProgramStatement =
  | ExportAllDeclaration
  | ExportDefaultDeclaration
  | ExportNamedDeclaration
  | ImportDeclaration
  | Statement
  | TSImportEqualsDeclaration
  | TSNamespaceExportDeclaration
export type Property = PropertyComputedName | PropertyNonComputedName
declare interface PropertyBase extends BaseNode {
  computed: boolean
  key: PropertyName
  kind: 'get' | 'init' | 'set'
  method: boolean
  optional: boolean
  shorthand: boolean
  type: AST_NODE_TYPES.Property
  value:
    | AssignmentPattern
    | BindingName
    | Expression
    | TSEmptyBodyFunctionExpression
}
export interface PropertyComputedName extends PropertyBase {
  computed: true
  key: PropertyNameComputed
}
export type PropertyDefinition =
  | PropertyDefinitionComputedName
  | PropertyDefinitionNonComputedName
declare interface PropertyDefinitionBase extends BaseNode {
  accessibility: Accessibility | undefined
  computed: boolean
  declare: boolean
  decorators: Decorator[]
  definite: boolean
  key: PropertyName
  optional: boolean
  override: boolean
  readonly: boolean
  static: boolean
  typeAnnotation: TSTypeAnnotation | undefined
  value: Expression | null
}
export interface PropertyDefinitionComputedName
  extends PropertyDefinitionComputedNameBase {
  type: AST_NODE_TYPES.PropertyDefinition
}
declare interface PropertyDefinitionComputedNameBase
  extends PropertyDefinitionBase {
  computed: true
  key: PropertyNameComputed
}
export interface PropertyDefinitionNonComputedName
  extends ClassPropertyDefinitionNonComputedNameBase {
  type: AST_NODE_TYPES.PropertyDefinition
}
declare interface PropertyDefinitionNonComputedNameBase
  extends PropertyDefinitionBase {
  computed: false
  key: PropertyNameNonComputed
}
export type PropertyName =
  | ClassPropertyNameNonComputed
  | PropertyNameComputed
  | PropertyNameNonComputed
export type PropertyNameComputed = Expression
export type PropertyNameNonComputed = Identifier | NumberLiteral | StringLiteral
export interface PropertyNonComputedName extends PropertyBase {
  computed: false
  key: PropertyNameNonComputed
}
export interface PunctuatorToken extends BaseToken {
  type: AST_TOKEN_TYPES.Punctuator
  value: ValueOf<PunctuatorTokenToText>
}
export interface PunctuatorTokenToText extends AssignmentOperatorToText {
  [SyntaxKind.AmpersandAmpersandToken]: '&&'
  [SyntaxKind.AmpersandToken]: '&'
  [SyntaxKind.AsteriskAsteriskToken]: '**'
  [SyntaxKind.AsteriskToken]: '*'
  [SyntaxKind.AtToken]: '@'
  [SyntaxKind.BacktickToken]: '`'
  [SyntaxKind.BarBarToken]: '||'
  [SyntaxKind.BarToken]: '|'
  [SyntaxKind.CaretToken]: '^'
  [SyntaxKind.CloseBraceToken]: '}'
  [SyntaxKind.CloseBracketToken]: ']'
  [SyntaxKind.CloseParenToken]: ')'
  [SyntaxKind.ColonToken]: ':'
  [SyntaxKind.CommaToken]: ','
  [SyntaxKind.DotDotDotToken]: '...'
  [SyntaxKind.DotToken]: '.'
  [SyntaxKind.EqualsEqualsEqualsToken]: '==='
  [SyntaxKind.EqualsEqualsToken]: '=='
  [SyntaxKind.EqualsGreaterThanToken]: '=>'
  [SyntaxKind.ExclamationEqualsEqualsToken]: '!=='
  [SyntaxKind.ExclamationEqualsToken]: '!='
  [SyntaxKind.ExclamationToken]: '!'
  [SyntaxKind.GreaterThanEqualsToken]: '>='
  [SyntaxKind.GreaterThanGreaterThanGreaterThanToken]: '>>>'
  [SyntaxKind.GreaterThanGreaterThanToken]: '>>'
  [SyntaxKind.GreaterThanToken]: '>'
  [SyntaxKind.HashToken]: '#'
  [SyntaxKind.LessThanEqualsToken]: '<='
  [SyntaxKind.LessThanLessThanToken]: '<<'
  [SyntaxKind.LessThanSlashToken]: '</'
  [SyntaxKind.LessThanToken]: '<'
  [SyntaxKind.MinusMinusToken]: '--'
  [SyntaxKind.MinusToken]: '-'
  [SyntaxKind.OpenBraceToken]: '{'
  [SyntaxKind.OpenBracketToken]: '['
  [SyntaxKind.OpenParenToken]: '('
  [SyntaxKind.PercentToken]: '%'
  [SyntaxKind.PlusPlusToken]: '++'
  [SyntaxKind.PlusToken]: '+'
  [SyntaxKind.QuestionDotToken]: '?.'
  [SyntaxKind.QuestionQuestionToken]: '??'
  [SyntaxKind.QuestionToken]: '?'
  [SyntaxKind.SemicolonToken]: ';'
  [SyntaxKind.SlashToken]: '/'
  [SyntaxKind.TildeToken]: '~'
}
/**
 * An array of two numbers.
 * Both numbers are a 0-based index which is the position in the array of source code characters.
 * The first is the start position of the node, the second is the end position of the node.
 */
export type Range = [number, number]
export interface RegExpLiteral extends LiteralBase {
  regex: {
    flags: string
    pattern: string
  }
  value: RegExp | null
}
export interface RegularExpressionToken extends BaseToken {
  regex: {
    flags: string
    pattern: string
  }
  type: AST_TOKEN_TYPES.RegularExpression
}
export interface RestElement extends BaseNode {
  argument: DestructuringPattern
  decorators: Decorator[]
  optional: boolean
  type: AST_NODE_TYPES.RestElement
  typeAnnotation: TSTypeAnnotation | undefined
  value: AssignmentPattern | undefined
}
export interface ReturnStatement extends BaseNode {
  argument: Expression | null
  type: AST_NODE_TYPES.ReturnStatement
}
export interface SequenceExpression extends BaseNode {
  expressions: Expression[]
  type: AST_NODE_TYPES.SequenceExpression
}
export interface SourceLocation {
  /**
   * The position of the first character after the parsed source region
   */
  end: Position
  /**
   * The position of the first character of the parsed source region
   */
  start: Position
}
export interface SpreadElement extends BaseNode {
  argument: Expression
  type: AST_NODE_TYPES.SpreadElement
}
export type Statement =
  | BlockStatement
  | BreakStatement
  | ClassDeclarationWithName
  | ContinueStatement
  | DebuggerStatement
  | DoWhileStatement
  | EmptyStatement
  | ExportAllDeclaration
  | ExportDefaultDeclaration
  | ExportNamedDeclaration
  | ExpressionStatement
  | ForInStatement
  | ForOfStatement
  | ForStatement
  | FunctionDeclarationWithName
  | IfStatement
  | ImportDeclaration
  | LabeledStatement
  | ReturnStatement
  | SwitchStatement
  | ThrowStatement
  | TryStatement
  | TSDeclareFunction
  | TSEnumDeclaration
  | TSExportAssignment
  | TSImportEqualsDeclaration
  | TSInterfaceDeclaration
  | TSModuleDeclaration
  | TSNamespaceExportDeclaration
  | TSTypeAliasDeclaration
  | VariableDeclaration
  | WhileStatement
  | WithStatement
export interface StaticBlock extends BaseNode {
  body: Statement[]
  type: AST_NODE_TYPES.StaticBlock
}
export interface StringLiteral extends LiteralBase {
  value: string
}
export interface StringToken extends BaseToken {
  type: AST_TOKEN_TYPES.String
}
export interface Super extends BaseNode {
  type: AST_NODE_TYPES.Super
}
export interface SwitchCase extends BaseNode {
  consequent: Statement[]
  test: Expression | null
  type: AST_NODE_TYPES.SwitchCase
}
export interface SwitchStatement extends BaseNode {
  cases: SwitchCase[]
  discriminant: Expression
  type: AST_NODE_TYPES.SwitchStatement
}
export interface TaggedTemplateExpression extends BaseNode {
  quasi: TemplateLiteral
  tag: Expression
  type: AST_NODE_TYPES.TaggedTemplateExpression
  typeArguments: TSTypeParameterInstantiation | undefined
}
export interface TemplateElement extends BaseNode {
  tail: boolean
  type: AST_NODE_TYPES.TemplateElement
  value: {
    cooked: string
    raw: string
  }
}
export interface TemplateLiteral extends BaseNode {
  expressions: Expression[]
  quasis: TemplateElement[]
  type: AST_NODE_TYPES.TemplateLiteral
}
export interface TemplateToken extends BaseToken {
  type: AST_TOKEN_TYPES.Template
}
export interface ThisExpression extends BaseNode {
  type: AST_NODE_TYPES.ThisExpression
}
export interface ThrowStatement extends BaseNode {
  argument: Expression
  type: AST_NODE_TYPES.ThrowStatement
}
export type Token =
  | BooleanToken
  | Comment
  | IdentifierToken
  | JSXIdentifierToken
  | JSXTextToken
  | KeywordToken
  | NullToken
  | NumericToken
  | PunctuatorToken
  | RegularExpressionToken
  | StringToken
  | TemplateToken
export interface TryStatement extends BaseNode {
  block: BlockStatement
  finalizer: BlockStatement | null
  handler: CatchClause | null
  type: AST_NODE_TYPES.TryStatement
}
export type TSAbstractAccessorProperty =
  | TSAbstractAccessorPropertyComputedName
  | TSAbstractAccessorPropertyNonComputedName
export interface TSAbstractAccessorPropertyComputedName
  extends PropertyDefinitionComputedNameBase {
  type: AST_NODE_TYPES.TSAbstractAccessorProperty
  value: null
}
export interface TSAbstractAccessorPropertyNonComputedName
  extends PropertyDefinitionNonComputedNameBase {
  type: AST_NODE_TYPES.TSAbstractAccessorProperty
  value: null
}
export interface TSAbstractKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSAbstractKeyword
}
export type TSAbstractMethodDefinition =
  | TSAbstractMethodDefinitionComputedName
  | TSAbstractMethodDefinitionNonComputedName
export interface TSAbstractMethodDefinitionComputedName
  extends MethodDefinitionComputedNameBase {
  type: AST_NODE_TYPES.TSAbstractMethodDefinition
}
export interface TSAbstractMethodDefinitionNonComputedName
  extends MethodDefinitionNonComputedNameBase {
  type: AST_NODE_TYPES.TSAbstractMethodDefinition
}
export type TSAbstractPropertyDefinition =
  | TSAbstractPropertyDefinitionComputedName
  | TSAbstractPropertyDefinitionNonComputedName
export interface TSAbstractPropertyDefinitionComputedName
  extends PropertyDefinitionComputedNameBase {
  type: AST_NODE_TYPES.TSAbstractPropertyDefinition
  value: null
}
export interface TSAbstractPropertyDefinitionNonComputedName
  extends PropertyDefinitionNonComputedNameBase {
  type: AST_NODE_TYPES.TSAbstractPropertyDefinition
  value: null
}
export interface TSAnyKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSAnyKeyword
}
export interface TSArrayType extends BaseNode {
  elementType: TypeNode
  type: AST_NODE_TYPES.TSArrayType
}
export interface TSAsExpression extends BaseNode {
  expression: Expression
  type: AST_NODE_TYPES.TSAsExpression
  typeAnnotation: TypeNode
}
export interface TSAsyncKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSAsyncKeyword
}
export interface TSBigIntKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSBigIntKeyword
}
export interface TSBooleanKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSBooleanKeyword
}
export interface TSCallSignatureDeclaration extends TSFunctionSignatureBase {
  type: AST_NODE_TYPES.TSCallSignatureDeclaration
}
export interface TSClassImplements extends TSHeritageBase {
  type: AST_NODE_TYPES.TSClassImplements
}
export interface TSConditionalType extends BaseNode {
  checkType: TypeNode
  extendsType: TypeNode
  falseType: TypeNode
  trueType: TypeNode
  type: AST_NODE_TYPES.TSConditionalType
}
export interface TSConstructorType extends TSFunctionSignatureBase {
  abstract: boolean
  type: AST_NODE_TYPES.TSConstructorType
}
export interface TSConstructSignatureDeclaration
  extends TSFunctionSignatureBase {
  type: AST_NODE_TYPES.TSConstructSignatureDeclaration
}
export type TSDeclareFunction =
  | TSDeclareFunctionNoDeclare
  | TSDeclareFunctionWithDeclare
declare interface TSDeclareFunctionBase extends FunctionBase {
  /**
   * TS1183: An implementation cannot be declared in ambient contexts.
   */
  body: undefined
  /**
   * Whether the declaration has `declare` modifier.
   */
  declare: boolean
  expression: false
  type: AST_NODE_TYPES.TSDeclareFunction
}
/**
 * Function declaration without the `declare` keyword:
 * ```
 * function foo(): void;
 * ```
 * This can either be an overload signature or a declaration in an ambient context
 * (e.g. `declare module`)
 */
export interface TSDeclareFunctionNoDeclare extends TSDeclareFunctionBase {
  declare: false
  /**
   * - TS1221: Generators are not allowed in an ambient context.
   * - TS1222: An overload signature cannot be declared as a generator.
   */
  generator: false
}
/**
 * Function declaration with the `declare` keyword:
 * ```
 * declare function foo(): void;
 * ```
 */
export interface TSDeclareFunctionWithDeclare extends TSDeclareFunctionBase {
  /**
   * TS1040: 'async' modifier cannot be used in an ambient context.
   */
  async: false
  declare: true
  /**
   * TS1221: Generators are not allowed in an ambient context.
   */
  generator: false
}
export interface TSDeclareKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSDeclareKeyword
}
export interface TSEmptyBodyFunctionExpression extends FunctionBase {
  body: null
  id: null
  type: AST_NODE_TYPES.TSEmptyBodyFunctionExpression
}
export interface TSEnumBody extends BaseNode {
  members: TSEnumMember[]
  type: AST_NODE_TYPES.TSEnumBody
}
export interface TSEnumDeclaration extends BaseNode {
  /**
   * The body of the enum.
   */
  body: TSEnumBody
  /**
   * Whether this is a `const` enum.
   * @example
   * ```ts
   * const enum Foo {}
   * ```
   */
  const: boolean
  /**
   * Whether this is a `declare`d enum.
   * @example
   * ```ts
   * declare enum Foo {}
   * ```
   */
  declare: boolean
  /**
   * The enum name.
   */
  id: Identifier
  /**
   * The enum members.
   * @deprecated Use {@link body} instead.
   */
  members: TSEnumMember[]
  type: AST_NODE_TYPES.TSEnumDeclaration
}
export type TSEnumMember =
  | TSEnumMemberComputedName
  | TSEnumMemberNonComputedName
declare interface TSEnumMemberBase extends BaseNode {
  computed: boolean
  id: PropertyNameComputed | PropertyNameNonComputed
  initializer: Expression | undefined
  type: AST_NODE_TYPES.TSEnumMember
}
/**
 * this should only really happen in semantically invalid code (errors 1164 and 2452)
 *
 * @example
 * ```ts
 * // VALID:
 * enum Foo { ['a'] }
 *
 * // INVALID:
 * const x = 'a';
 * enum Foo { [x] }
 * enum Bar { ['a' + 'b'] }
 * ```
 */
export interface TSEnumMemberComputedName extends TSEnumMemberBase {
  computed: true
  id: PropertyNameComputed
}
export interface TSEnumMemberNonComputedName extends TSEnumMemberBase {
  computed: false
  id: PropertyNameNonComputed
}
export interface TSExportAssignment extends BaseNode {
  expression: Expression
  type: AST_NODE_TYPES.TSExportAssignment
}
export interface TSExportKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSExportKeyword
}
export interface TSExternalModuleReference extends BaseNode {
  expression: StringLiteral
  type: AST_NODE_TYPES.TSExternalModuleReference
}
declare interface TSFunctionSignatureBase extends BaseNode {
  params: Parameter[]
  returnType: TSTypeAnnotation | undefined
  typeParameters: TSTypeParameterDeclaration | undefined
}
export interface TSFunctionType extends TSFunctionSignatureBase {
  type: AST_NODE_TYPES.TSFunctionType
}
declare interface TSHeritageBase extends BaseNode {
  expression: Expression
  typeArguments: TSTypeParameterInstantiation | undefined
}
export type TSImportEqualsDeclaration =
  | TSImportEqualsNamespaceDeclaration
  | TSImportEqualsRequireDeclaration
declare interface TSImportEqualsDeclarationBase extends BaseNode {
  /**
   * The locally imported name.
   */
  id: Identifier
  /**
   * The kind of the import. Always `'value'` unless `moduleReference` is a
   * `TSExternalModuleReference`.
   */
  importKind: ImportKind
  /**
   * The value being aliased.
   * @example
   * ```ts
   * import F1 = A;
   * import F2 = A.B.C;
   * import F3 = require('mod');
   * ```
   */
  moduleReference: Identifier | TSExternalModuleReference | TSQualifiedName
  type: AST_NODE_TYPES.TSImportEqualsDeclaration
}
export interface TSImportEqualsNamespaceDeclaration
  extends TSImportEqualsDeclarationBase {
  /**
   * The kind of the import.
   */
  importKind: 'value'
  /**
   * The value being aliased.
   * ```
   * import F1 = A;
   * import F2 = A.B.C;
   * ```
   */
  moduleReference: Identifier | TSQualifiedName
}
export interface TSImportEqualsRequireDeclaration
  extends TSImportEqualsDeclarationBase {
  /**
   * The kind of the import.
   */
  importKind: ImportKind
  /**
   * The value being aliased.
   * ```
   * import F3 = require('mod');
   * ```
   */
  moduleReference: TSExternalModuleReference
}
export interface TSImportType extends BaseNode {
  argument: TypeNode
  qualifier: EntityName | null
  type: AST_NODE_TYPES.TSImportType
  typeArguments: TSTypeParameterInstantiation | null
}
export interface TSIndexedAccessType extends BaseNode {
  indexType: TypeNode
  objectType: TypeNode
  type: AST_NODE_TYPES.TSIndexedAccessType
}
export interface TSIndexSignature extends BaseNode {
  accessibility: Accessibility | undefined
  parameters: Parameter[]
  readonly: boolean
  static: boolean
  type: AST_NODE_TYPES.TSIndexSignature
  typeAnnotation: TSTypeAnnotation | undefined
}
export interface TSInferType extends BaseNode {
  type: AST_NODE_TYPES.TSInferType
  typeParameter: TSTypeParameter
}
export interface TSInstantiationExpression extends BaseNode {
  expression: Expression
  type: AST_NODE_TYPES.TSInstantiationExpression
  typeArguments: TSTypeParameterInstantiation
}
export interface TSInterfaceBody extends BaseNode {
  body: TypeElement[]
  type: AST_NODE_TYPES.TSInterfaceBody
}
export interface TSInterfaceDeclaration extends BaseNode {
  /**
   * The body of the interface
   */
  body: TSInterfaceBody
  /**
   * Whether the interface was `declare`d
   */
  declare: boolean
  /**
   * The types this interface `extends`
   */
  extends: TSInterfaceHeritage[]
  /**
   * The name of this interface
   */
  id: Identifier
  type: AST_NODE_TYPES.TSInterfaceDeclaration
  /**
   * The generic type parameters declared for the interface. Empty declaration
   * (`<>`) is different from no declaration.
   */
  typeParameters: TSTypeParameterDeclaration | undefined
}
export interface TSInterfaceHeritage extends TSHeritageBase {
  type: AST_NODE_TYPES.TSInterfaceHeritage
}
export interface TSIntersectionType extends BaseNode {
  type: AST_NODE_TYPES.TSIntersectionType
  types: TypeNode[]
}
export interface TSIntrinsicKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSIntrinsicKeyword
}
export interface TSLiteralType extends BaseNode {
  literal: LiteralExpression | UnaryExpression | UpdateExpression
  type: AST_NODE_TYPES.TSLiteralType
}
export interface TSMappedType extends BaseNode {
  constraint: TypeNode
  key: Identifier
  nameType: TypeNode | null
  optional: '+' | '-' | boolean | undefined
  readonly: '+' | '-' | boolean | undefined
  type: AST_NODE_TYPES.TSMappedType
  typeAnnotation: TypeNode | undefined
  /** @deprecated Use {@link `constraint`} and {@link `key`} instead. */
  typeParameter: TSTypeParameter
}
export type TSMethodSignature =
  | TSMethodSignatureComputedName
  | TSMethodSignatureNonComputedName
declare interface TSMethodSignatureBase extends BaseNode {
  accessibility: Accessibility | undefined
  computed: boolean
  key: PropertyName
  kind: 'get' | 'method' | 'set'
  optional: boolean
  params: Parameter[]
  readonly: boolean
  returnType: TSTypeAnnotation | undefined
  static: boolean
  type: AST_NODE_TYPES.TSMethodSignature
  typeParameters: TSTypeParameterDeclaration | undefined
}
export interface TSMethodSignatureComputedName extends TSMethodSignatureBase {
  computed: true
  key: PropertyNameComputed
}
export interface TSMethodSignatureNonComputedName
  extends TSMethodSignatureBase {
  computed: false
  key: PropertyNameNonComputed
}
export interface TSModuleBlock extends BaseNode {
  body: ProgramStatement[]
  type: AST_NODE_TYPES.TSModuleBlock
}
export type TSModuleDeclaration =
  | TSModuleDeclarationGlobal
  | TSModuleDeclarationModule
  | TSModuleDeclarationNamespace
declare interface TSModuleDeclarationBase extends BaseNode {
  /**
   * The body of the module.
   * This can only be `undefined` for the code `declare module 'mod';`
   */
  body?: TSModuleBlock
  /**
   * Whether the module is `declare`d
   * @example
   * ```ts
   * declare namespace F {}
   * ```
   */
  declare: boolean
  /**
   * Whether this is a global declaration
   * @example
   * ```ts
   * declare global {}
   * ```
   *
   * @deprecated Use {@link kind} instead
   */
  global: boolean
  /**
   * The name of the module
   * ```
   * namespace A {}
   * namespace A.B.C {}
   * module 'a' {}
   * ```
   */
  id: Identifier | Literal | TSQualifiedName
  /**
   * The keyword used to define this module declaration
   * @example
   * ```ts
   * namespace Foo {}
   * ^^^^^^^^^
   *
   * module 'foo' {}
   * ^^^^^^
   *
   * global {}
   * ^^^^^^
   * ```
   */
  kind: TSModuleDeclarationKind
  type: AST_NODE_TYPES.TSModuleDeclaration
}
export interface TSModuleDeclarationGlobal extends TSModuleDeclarationBase {
  body: TSModuleBlock
  /**
   * This will always be an Identifier with name `global`
   */
  id: Identifier
  kind: 'global'
}
export type TSModuleDeclarationKind = 'global' | 'module' | 'namespace'
export type TSModuleDeclarationModule =
  | TSModuleDeclarationModuleWithIdentifierId
  | TSModuleDeclarationModuleWithStringId
declare interface TSModuleDeclarationModuleBase
  extends TSModuleDeclarationBase {
  kind: 'module'
}
/**
 * The legacy module declaration, replaced with namespace declarations.
 * ```
 * module A {}
 * ```
 */
export interface TSModuleDeclarationModuleWithIdentifierId
  extends TSModuleDeclarationModuleBase {
  body: TSModuleBlock
  id: Identifier
  kind: 'module'
}
export type TSModuleDeclarationModuleWithStringId =
  | TSModuleDeclarationModuleWithStringIdDeclared
  | TSModuleDeclarationModuleWithStringIdNotDeclared
/**
 * A string module declaration that is declared:
 * ```
 * declare module 'foo' {}
 * declare module 'foo';
 * ```
 */
export interface TSModuleDeclarationModuleWithStringIdDeclared
  extends TSModuleDeclarationModuleBase {
  body?: TSModuleBlock
  declare: true
  id: StringLiteral
  kind: 'module'
}
/**
 * A string module declaration that is not declared:
 * ```
 * module 'foo' {}
 * ```
 */
export interface TSModuleDeclarationModuleWithStringIdNotDeclared
  extends TSModuleDeclarationModuleBase {
  body: TSModuleBlock
  declare: false
  id: StringLiteral
  kind: 'module'
}
export interface TSModuleDeclarationNamespace extends TSModuleDeclarationBase {
  body: TSModuleBlock
  id: Identifier | TSQualifiedName
  kind: 'namespace'
}
export interface TSNamedTupleMember extends BaseNode {
  elementType: TypeNode
  label: Identifier
  optional: boolean
  type: AST_NODE_TYPES.TSNamedTupleMember
}
/**
 * For the following declaration:
 * ```
 * export as namespace X;
 * ```
 */
export interface TSNamespaceExportDeclaration extends BaseNode {
  /**
   * The name of the global variable that's exported as namespace
   */
  id: Identifier
  type: AST_NODE_TYPES.TSNamespaceExportDeclaration
}
export interface TSNeverKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSNeverKeyword
}
export interface TSNonNullExpression extends BaseNode {
  expression: Expression
  type: AST_NODE_TYPES.TSNonNullExpression
}
export interface TSNullKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSNullKeyword
}
export interface TSNumberKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSNumberKeyword
}
export interface TSObjectKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSObjectKeyword
}
export interface TSOptionalType extends BaseNode {
  type: AST_NODE_TYPES.TSOptionalType
  typeAnnotation: TypeNode
}
export interface TSParameterProperty extends BaseNode {
  accessibility: Accessibility | undefined
  decorators: Decorator[]
  override: boolean
  parameter: AssignmentPattern | BindingName | RestElement
  readonly: boolean
  static: boolean
  type: AST_NODE_TYPES.TSParameterProperty
}
export interface TSPrivateKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSPrivateKeyword
}
export type TSPropertySignature =
  | TSPropertySignatureComputedName
  | TSPropertySignatureNonComputedName
declare interface TSPropertySignatureBase extends BaseNode {
  accessibility: Accessibility | undefined
  computed: boolean
  key: PropertyName
  optional: boolean
  readonly: boolean
  static: boolean
  type: AST_NODE_TYPES.TSPropertySignature
  typeAnnotation: TSTypeAnnotation | undefined
}
export interface TSPropertySignatureComputedName
  extends TSPropertySignatureBase {
  computed: true
  key: PropertyNameComputed
}
export interface TSPropertySignatureNonComputedName
  extends TSPropertySignatureBase {
  computed: false
  key: PropertyNameNonComputed
}
export interface TSProtectedKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSProtectedKeyword
}
export interface TSPublicKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSPublicKeyword
}
export interface TSQualifiedName extends BaseNode {
  left: EntityName
  right: Identifier
  type: AST_NODE_TYPES.TSQualifiedName
}
export interface TSReadonlyKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSReadonlyKeyword
}
export interface TSRestType extends BaseNode {
  type: AST_NODE_TYPES.TSRestType
  typeAnnotation: TypeNode
}
export interface TSSatisfiesExpression extends BaseNode {
  expression: Expression
  type: AST_NODE_TYPES.TSSatisfiesExpression
  typeAnnotation: TypeNode
}
export interface TSStaticKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSStaticKeyword
}
export interface TSStringKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSStringKeyword
}
export interface TSSymbolKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSSymbolKeyword
}
export interface TSTemplateLiteralType extends BaseNode {
  quasis: TemplateElement[]
  type: AST_NODE_TYPES.TSTemplateLiteralType
  types: TypeNode[]
}
export interface TSThisType extends BaseNode {
  type: AST_NODE_TYPES.TSThisType
}
export interface TSTupleType extends BaseNode {
  elementTypes: TypeNode[]
  type: AST_NODE_TYPES.TSTupleType
}
export interface TSTypeAliasDeclaration extends BaseNode {
  /**
   * Whether the type was `declare`d.
   * @example
   * ```ts
   * declare type T = 1;
   * ```
   */
  declare: boolean
  /**
   * The name of the type.
   */
  id: Identifier
  type: AST_NODE_TYPES.TSTypeAliasDeclaration
  /**
   * The "value" (type) of the declaration
   */
  typeAnnotation: TypeNode
  /**
   * The generic type parameters declared for the type. Empty declaration
   * (`<>`) is different from no declaration.
   */
  typeParameters: TSTypeParameterDeclaration | undefined
}
export interface TSTypeAnnotation extends BaseNode {
  type: AST_NODE_TYPES.TSTypeAnnotation
  typeAnnotation: TypeNode
}
export interface TSTypeAssertion extends BaseNode {
  expression: Expression
  type: AST_NODE_TYPES.TSTypeAssertion
  typeAnnotation: TypeNode
}
export interface TSTypeLiteral extends BaseNode {
  members: TypeElement[]
  type: AST_NODE_TYPES.TSTypeLiteral
}
export interface TSTypeOperator extends BaseNode {
  operator: 'keyof' | 'readonly' | 'unique'
  type: AST_NODE_TYPES.TSTypeOperator
  typeAnnotation: TypeNode | undefined
}
export interface TSTypeParameter extends BaseNode {
  const: boolean
  constraint: TypeNode | undefined
  default: TypeNode | undefined
  in: boolean
  name: Identifier
  out: boolean
  type: AST_NODE_TYPES.TSTypeParameter
}
export interface TSTypeParameterDeclaration extends BaseNode {
  params: TSTypeParameter[]
  type: AST_NODE_TYPES.TSTypeParameterDeclaration
}
export interface TSTypeParameterInstantiation extends BaseNode {
  params: TypeNode[]
  type: AST_NODE_TYPES.TSTypeParameterInstantiation
}
export interface TSTypePredicate extends BaseNode {
  asserts: boolean
  parameterName: Identifier | TSThisType
  type: AST_NODE_TYPES.TSTypePredicate
  typeAnnotation: TSTypeAnnotation | null
}
export interface TSTypeQuery extends BaseNode {
  exprName: EntityName | TSImportType
  type: AST_NODE_TYPES.TSTypeQuery
  typeArguments: TSTypeParameterInstantiation | undefined
}
export interface TSTypeReference extends BaseNode {
  type: AST_NODE_TYPES.TSTypeReference
  typeArguments: TSTypeParameterInstantiation | undefined
  typeName: EntityName
}
export type TSUnaryExpression =
  | AwaitExpression
  | LeftHandSideExpression
  | UnaryExpression
  | UpdateExpression
export interface TSUndefinedKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSUndefinedKeyword
}
export interface TSUnionType extends BaseNode {
  type: AST_NODE_TYPES.TSUnionType
  types: TypeNode[]
}
export interface TSUnknownKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSUnknownKeyword
}
export interface TSVoidKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSVoidKeyword
}
export type TypeElement =
  | TSCallSignatureDeclaration
  | TSConstructSignatureDeclaration
  | TSIndexSignature
  | TSMethodSignature
  | TSPropertySignature
export type TypeNode =
  | TSAbstractKeyword
  | TSAnyKeyword
  | TSArrayType
  | TSAsyncKeyword
  | TSBigIntKeyword
  | TSBooleanKeyword
  | TSConditionalType
  | TSConstructorType
  | TSDeclareKeyword
  | TSExportKeyword
  | TSFunctionType
  | TSImportType
  | TSIndexedAccessType
  | TSInferType
  | TSIntersectionType
  | TSIntrinsicKeyword
  | TSLiteralType
  | TSMappedType
  | TSNamedTupleMember
  | TSNeverKeyword
  | TSNullKeyword
  | TSNumberKeyword
  | TSObjectKeyword
  | TSOptionalType
  | TSPrivateKeyword
  | TSProtectedKeyword
  | TSPublicKeyword
  | TSQualifiedName
  | TSReadonlyKeyword
  | TSRestType
  | TSStaticKeyword
  | TSStringKeyword
  | TSSymbolKeyword
  | TSTemplateLiteralType
  | TSThisType
  | TSTupleType
  | TSTypeLiteral
  | TSTypeOperator
  | TSTypePredicate
  | TSTypeQuery
  | TSTypeReference
  | TSUndefinedKeyword
  | TSUnionType
  | TSUnknownKeyword
  | TSVoidKeyword
export interface UnaryExpression extends UnaryExpressionBase {
  operator: '!' | '+' | '~' | '-' | 'delete' | 'typeof' | 'void'
  type: AST_NODE_TYPES.UnaryExpression
}
declare interface UnaryExpressionBase extends BaseNode {
  argument: Expression
  operator: string
  prefix: boolean
}
export interface UpdateExpression extends UnaryExpressionBase {
  operator: '++' | '--'
  type: AST_NODE_TYPES.UpdateExpression
}
export type UsingDeclaration =
  | UsingInForOfDeclaration
  | UsingInNormalContextDeclaration
declare interface UsingDeclarationBase extends BaseNode {
  /**
   * This value will always be `false`
   * because 'declare' modifier cannot appear on a 'using' declaration.
   */
  declare: false
  /**
   * The keyword used to declare the variable(s)
   * @example
   * ```ts
   * using x = 1;
   * await using y = 2;
   * ```
   */
  kind: 'await using' | 'using'
  type: AST_NODE_TYPES.VariableDeclaration
}
export type UsingDeclarator =
  | UsingInForOfDeclarator
  | UsingInNormalContextDeclarator
export interface UsingInForOfDeclaration extends UsingDeclarationBase {
  /**
   * The variables declared by this declaration.
   * Always has exactly one element.
   * @example
   * ```ts
   * for (using x of y) {}
   * ```
   */
  declarations: [UsingInForOfDeclarator]
}
export interface UsingInForOfDeclarator extends VariableDeclaratorBase {
  definite: false
  id: Identifier
  init: null
}
export interface UsingInNormalContextDeclaration extends UsingDeclarationBase {
  /**
   * The variables declared by this declaration.
   * Always non-empty.
   * @example
   * ```ts
   * using x = 1;
   * using y = 1, z = 2;
   * ```
   */
  declarations: UsingInNormalContextDeclarator[]
}
export interface UsingInNormalContextDeclarator extends VariableDeclaratorBase {
  definite: false
  id: Identifier
  init: Expression
}
declare type ValueOf<T> = T[keyof T]
export type VariableDeclaration = LetOrConstOrVarDeclaration | UsingDeclaration
export type VariableDeclarator = LetOrConstOrVarDeclarator | UsingDeclarator
declare interface VariableDeclaratorBase extends BaseNode {
  /**
   * Whether there's definite assignment assertion (`let x!: number`).
   * If `true`, then: `id` must be an identifier with a type annotation,
   * `init` must be `null`, and the declarator must be a `var`/`let` declarator.
   */
  definite: boolean
  /**
   * The name(s) of the variable(s).
   */
  id: BindingName
  /**
   * The initializer expression of the variable. Must be present for `const` unless
   * in a `declare const`.
   */
  init: Expression | null
  type: AST_NODE_TYPES.VariableDeclarator
}
export interface VariableDeclaratorDefiniteAssignment
  extends VariableDeclaratorBase {
  definite: true
  /**
   * The name of the variable. Must have a type annotation.
   */
  id: Identifier
  init: null
}
export interface VariableDeclaratorMaybeInit extends VariableDeclaratorBase {
  definite: false
}
export interface VariableDeclaratorNoInit extends VariableDeclaratorBase {
  definite: false
  init: null
}
export interface WhileStatement extends BaseNode {
  body: Statement
  test: Expression
  type: AST_NODE_TYPES.WhileStatement
}
export interface WithStatement extends BaseNode {
  body: Statement
  object: Expression
  type: AST_NODE_TYPES.WithStatement
}
export interface YieldExpression extends BaseNode {
  argument: Expression | undefined
  delegate: boolean
  type: AST_NODE_TYPES.YieldExpression
}
export {}
//# sourceMappingURL=ast-spec.d.ts.map
