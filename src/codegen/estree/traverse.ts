import { TSESTree as ts } from '@typescript-eslint/types'

import { exhaustive } from '@/utils/typescript'

import { NodeType } from './nodes'

type Visitor = {
  [P in ts.Node['type']]?: (node: Extract<ts.Node, { type: P }>) => void
} & {
  enter?: (node: ts.Node) => void
  leave?: (node: ts.Node) => void
}

export function traverse(node: ts.Node, visitor: Visitor) {
  function visit<N extends ts.Node>(node: N, callback?: (node: N) => void) {
    visitor.enter?.(node)

    callback?.(node)

    visitor.leave?.(node)
  }

  switch (node.type) {
    case NodeType.AccessorProperty:
      return visit(node, (node) => {
        traverse(node.key, visitor)

        node.decorators.forEach((node) => traverse(node, visitor))
        node.typeAnnotation && traverse(node.typeAnnotation, visitor)

        visitor[NodeType.AccessorProperty]?.(node)
      })

    case NodeType.ArrayExpression:
      return visit(node, (node) => {
        node.elements.forEach((node) => {
          node && traverse(node, visitor)
        })

        visitor[NodeType.ArrayExpression]?.(node)
      })

    case NodeType.ArrayPattern:
      return visit(node, (node) => {
        node.elements.forEach((node) => {
          node && traverse(node, visitor)
        })

        node.decorators.forEach((node) => traverse(node, visitor))

        visitor[NodeType.ArrayPattern]?.(node)
      })

    case NodeType.ArrowFunctionExpression:
      return visit(node, (node) => {
        node.params.forEach((node) => traverse(node, visitor))

        traverse(node.body, visitor)

        node.returnType && traverse(node.returnType, visitor)
        node.typeParameters && traverse(node.typeParameters, visitor)

        visitor[NodeType.ArrowFunctionExpression]?.(node)
      })

    case NodeType.AssignmentExpression:
      return visit(node, (node) => {
        traverse(node.left, visitor)
        traverse(node.right, visitor)

        visitor[NodeType.AssignmentExpression]?.(node)
      })

    case NodeType.AssignmentPattern:
      return visit(node, (node) => {
        traverse(node.left, visitor)
        traverse(node.right, visitor)

        node.decorators.forEach((node) => traverse(node, visitor))
        node.typeAnnotation && traverse(node.typeAnnotation, visitor)

        visitor[NodeType.AssignmentPattern]?.(node)
      })

    case NodeType.AwaitExpression:
      return visit(node, (node) => {
        traverse(node.argument, visitor)

        visitor[NodeType.AwaitExpression]?.(node)
      })

    case NodeType.BinaryExpression:
      return visit(node, (node) => {
        traverse(node.left, visitor)
        traverse(node.right, visitor)

        visitor[NodeType.BinaryExpression]?.(node)
      })

    case NodeType.BlockStatement:
      return visit(node, (node) => {
        node.body.forEach((node) => traverse(node, visitor))

        visitor[NodeType.BlockStatement]?.(node)
      })

    case NodeType.BreakStatement:
      return visit(node, (node) => {
        visitor[NodeType.BreakStatement]?.(node)
      })

    case NodeType.CallExpression:
      return visit(node, (node) => {
        traverse(node.callee, visitor)
        node.arguments.forEach((node) => traverse(node, visitor))

        node.typeArguments && traverse(node.typeArguments, visitor)

        visitor[NodeType.CallExpression]?.(node)
      })

    case NodeType.CatchClause:
      return visit(node, (node) => {
        node.param && traverse(node.param, visitor)

        traverse(node.body, visitor)

        visitor[NodeType.CatchClause]?.(node)
      })

    case NodeType.ChainExpression:
      return visit(node, (node) => {
        traverse(node.expression, visitor)

        visitor[NodeType.ChainExpression]?.(node)
      })

    case NodeType.ClassBody:
      return visit(node, (node) => {
        node.body.forEach((node) => traverse(node, visitor))

        visitor[NodeType.ClassBody]?.(node)
      })

    case NodeType.ClassDeclaration:
      return visit(node, (node) => {
        node.id && traverse(node.id, visitor)
        node.superClass && traverse(node.superClass, visitor)

        traverse(node.body, visitor)

        node.decorators.forEach((node) => traverse(node, visitor))

        node.implements &&
          node.implements.forEach((node) => traverse(node, visitor))

        node.typeParameters && traverse(node.typeParameters, visitor)
        node.superTypeArguments && traverse(node.superTypeArguments, visitor)

        visitor[NodeType.ClassDeclaration]?.(node)
      })

    case NodeType.ClassExpression:
      return visit(node, (node) => {
        node.id && traverse(node.id, visitor)
        node.superClass && traverse

        traverse(node.body, visitor)

        node.decorators.forEach((node) => traverse(node, visitor))

        node.implements &&
          node.implements.forEach((node) => traverse(node, visitor))

        node.typeParameters && traverse(node.typeParameters, visitor)
        node.superTypeArguments && traverse(node.superTypeArguments, visitor)

        visitor[NodeType.ClassExpression]?.(node)
      })

    case NodeType.ConditionalExpression:
      return visit(node, (node) => {
        traverse(node.test, visitor)
        traverse(node.consequent, visitor)
        traverse(node.alternate, visitor)

        visitor[NodeType.ConditionalExpression]?.(node)
      })

    case NodeType.ContinueStatement:
      return visit(node, (node) => {
        node.label && traverse(node.label, visitor)

        visitor[NodeType.ContinueStatement]?.(node)
      })

    case NodeType.DebuggerStatement:
      return visit(node, (node) => {
        visitor[NodeType.DebuggerStatement]?.(node)
      })

    case NodeType.Decorator:
      return visit(node, (node) => {
        traverse(node.expression, visitor)

        visitor[NodeType.Decorator]?.(node)
      })

    case NodeType.DoWhileStatement:
      return visit(node, (node) => {
        visitor[NodeType.DoWhileStatement]?.(node)
      })

    case NodeType.EmptyStatement:
      return visit(node, (node) => {
        visitor[NodeType.EmptyStatement]?.(node)
      })

    case NodeType.ExportAllDeclaration:
      return visit(node, (node) => {
        traverse(node.source, visitor)

        node.exported && traverse(node.exported, visitor)

        node.attributes.forEach((node) => traverse(node, visitor))
        node.assertions.forEach((node) => traverse(node, visitor))

        visitor[NodeType.ExportAllDeclaration]?.(node)
      })

    case NodeType.ExportDefaultDeclaration:
      return visit(node, (node) => {
        traverse(node.declaration, visitor)

        visitor[NodeType.ExportDefaultDeclaration]?.(node)
      })

    case NodeType.ExportNamedDeclaration:
      return visit(node, (node) => {
        node.source && traverse(node.source, visitor)
        node.declaration && traverse(node.declaration, visitor)
        node.specifiers.forEach((node) => traverse(node, visitor))

        node.attributes.forEach((node) => traverse(node, visitor))
        node.assertions.forEach((node) => traverse(node, visitor))

        visitor[NodeType.ExportNamedDeclaration]?.(node)
      })

    case NodeType.ExportSpecifier:
      return visit(node, (node) => {
        traverse(node.local, visitor)
        traverse(node.exported, visitor)

        visitor[NodeType.ExportSpecifier]?.(node)
      })

    case NodeType.ExpressionStatement:
      return visit(node, (node) => {
        traverse(node.expression, visitor)

        visitor[NodeType.ExpressionStatement]?.(node)
      })

    case NodeType.ForInStatement:
      return visit(node, (node) => {
        traverse(node.left, visitor)
        traverse(node.right, visitor)

        traverse(node.body, visitor)

        visitor[NodeType.ForInStatement]?.(node)
      })

    case NodeType.ForOfStatement:
      return visit(node, (node) => {
        traverse(node.left, visitor)
        traverse(node.right, visitor)

        traverse(node.body, visitor)

        visitor[NodeType.ForOfStatement]?.(node)
      })

    case NodeType.ForStatement:
      return visit(node, (node) => {
        node.init && traverse(node.init, visitor)
        node.test && traverse(node.test, visitor)
        node.update && traverse(node.update, visitor)

        traverse(node.body, visitor)

        visitor[NodeType.ForStatement]?.(node)
      })

    case NodeType.FunctionDeclaration:
      return visit(node, (node) => {
        node.id && traverse(node.id, visitor)
        node.params.forEach((node) => traverse(node, visitor))

        traverse(node.body, visitor)

        node.returnType && traverse(node.returnType, visitor)
        node.typeParameters && traverse(node.typeParameters, visitor)

        visitor[NodeType.FunctionDeclaration]?.(node)
      })

    case NodeType.FunctionExpression:
      return visit(node, (node) => {
        node.id && traverse(node.id, visitor)
        node.params.forEach((node) => traverse(node, visitor))

        traverse(node.body, visitor)

        node.returnType && traverse(node.returnType, visitor)
        node.typeParameters && traverse(node.typeParameters, visitor)

        visitor[NodeType.FunctionExpression]?.(node)
      })

    case NodeType.Identifier:
      return visit(node, (node) => {
        visitor[NodeType.Identifier]?.(node)
      })

    case NodeType.IfStatement:
      return visit(node, (node) => {
        traverse(node.test, visitor)
        traverse(node.consequent, visitor)
        node.alternate && traverse(node.alternate, visitor)

        visitor[NodeType.IfStatement]?.(node)
      })

    case NodeType.ImportAttribute:
      return visit(node, (node) => {
        traverse(node.key, visitor)
        traverse(node.value, visitor)

        visitor[NodeType.ImportAttribute]?.(node)
      })

    case NodeType.ImportDeclaration:
      return visit(node, (node) => {
        traverse(node.source, visitor)

        node.specifiers.forEach((node) => traverse(node, visitor))
        node.attributes.forEach((node) => traverse(node, visitor))
        node.assertions.forEach((node) => traverse(node, visitor))

        visitor[NodeType.ImportDeclaration]?.(node)
      })

    case NodeType.ImportDefaultSpecifier:
      return visit(node, (node) => {
        traverse(node.local, visitor)

        visitor[NodeType.ImportDefaultSpecifier]?.(node)
      })

    case NodeType.ImportExpression:
      return visit(node, (node) => {
        traverse(node.source, visitor)

        node.options && traverse(node.options, visitor)
        node.attributes && traverse(node.attributes, visitor)

        visitor[NodeType.ImportExpression]?.(node)
      })

    case NodeType.ImportNamespaceSpecifier:
      return visit(node, (node) => {
        traverse(node.local, visitor)

        visitor[NodeType.ImportNamespaceSpecifier]?.(node)
      })

    case NodeType.ImportSpecifier:
      return visit(node, (node) => {
        traverse(node.imported, visitor)
        traverse(node.local, visitor)

        visitor[NodeType.ImportSpecifier]?.(node)
      })

    case NodeType.JSXAttribute:
      return visit(node, (node) => {
        traverse(node.name, visitor)
        node.value && traverse(node.value, visitor)

        visitor[NodeType.JSXAttribute]?.(node)
      })

    case NodeType.JSXClosingElement:
      return visit(node, (node) => {
        traverse(node.name, visitor)

        visitor[NodeType.JSXClosingElement]?.(node)
      })

    case NodeType.JSXClosingFragment:
      return visit(node, (node) => {
        visitor[NodeType.JSXClosingFragment]?.(node)
      })

    case NodeType.JSXElement:
      return visit(node, (node) => {
        traverse(node.openingElement, visitor)

        node.children.forEach((node) => traverse(node, visitor))

        node.closingElement && traverse(node.closingElement, visitor)

        visitor[NodeType.JSXElement]?.(node)
      })

    case NodeType.JSXEmptyExpression:
      return visit(node, (node) => {
        visitor[NodeType.JSXEmptyExpression]?.(node)
      })

    case NodeType.JSXExpressionContainer:
      return visit(node, (node) => {
        traverse(node.expression, visitor)

        visitor[NodeType.JSXExpressionContainer]?.(node)
      })

    case NodeType.JSXFragment:
      return visit(node, (node) => {
        traverse(node.openingFragment, visitor)
        traverse(node.closingFragment, visitor)

        visitor[NodeType.JSXFragment]?.(node)
      })

    case NodeType.JSXIdentifier:
      return visit(node, (node) => {
        visitor[NodeType.JSXIdentifier]?.(node)
      })

    case NodeType.JSXMemberExpression:
      return visit(node, (node) => {
        traverse(node.property, visitor)
        traverse(node.object, visitor)

        visitor[NodeType.JSXMemberExpression]?.(node)
      })

    case NodeType.JSXNamespacedName:
      return visit(node, (node) => {
        traverse(node.namespace, visitor)
        traverse(node.name, visitor)

        visitor[NodeType.JSXNamespacedName]?.(node)
      })

    case NodeType.JSXOpeningElement:
      return visit(node, (node) => {
        traverse(node.name, visitor)

        node.attributes.forEach((node) => traverse(node, visitor))

        node.typeArguments && traverse(node.typeArguments, visitor)

        visitor[NodeType.JSXOpeningElement]?.(node)
      })

    case NodeType.JSXOpeningFragment:
      return visit(node, (node) => {
        visitor[NodeType.JSXOpeningFragment]?.(node)
      })

    case NodeType.JSXSpreadAttribute:
      return visit(node, (node) => {
        traverse(node.argument, visitor)

        visitor[NodeType.JSXSpreadAttribute]?.(node)
      })

    case NodeType.JSXSpreadChild:
      return visit(node, (node) => {
        traverse(node.expression, visitor)

        visitor[NodeType.JSXSpreadChild]?.(node)
      })

    case NodeType.JSXText:
      return visit(node, (node) => {
        visitor[NodeType.JSXText]?.(node)
      })

    case NodeType.LabeledStatement:
      return visit(node, (node) => {
        traverse(node.label, visitor)
        traverse(node.body, visitor)

        visitor[NodeType.LabeledStatement]?.(node)
      })

    case NodeType.Literal:
      return visit(node, (node) => {
        visitor[NodeType.Literal]?.(node)
      })

    case NodeType.LogicalExpression:
      return visit(node, (node) => {
        traverse(node.left, visitor)
        traverse(node.right, visitor)

        visitor[NodeType.LogicalExpression]?.(node)
      })

    case NodeType.MemberExpression:
      return visit(node, (node) => {
        traverse(node.object, visitor)
        traverse(node.property, visitor)

        visitor[NodeType.MemberExpression]?.(node)
      })

    case NodeType.MetaProperty:
      return visit(node, (node) => {
        traverse(node.meta, visitor)

        visitor[NodeType.MetaProperty]?.(node)
      })

    case NodeType.MethodDefinition:
      return visit(node, (node) => {
        traverse(node.key, visitor)
        traverse(node.value, visitor)

        node.decorators.forEach((node) => traverse(node, visitor))

        visitor[NodeType.MethodDefinition]?.(node)
      })

    case NodeType.NewExpression:
      return visit(node, (node) => {
        traverse(node.callee, visitor)

        node.arguments.forEach((node) => traverse(node, visitor))
        node.typeArguments && traverse(node.typeArguments, visitor)

        visitor[NodeType.NewExpression]?.(node)
      })

    case NodeType.ObjectExpression:
      return visit(node, (node) => {
        node.properties.forEach((node) => traverse(node, visitor))

        visitor[NodeType.ObjectExpression]?.(node)
      })

    case NodeType.ObjectPattern:
      return visit(node, (node) => {
        node.properties.forEach((node) => traverse(node, visitor))

        node.decorators.forEach((node) => traverse(node, visitor))
        node.typeAnnotation && traverse(node.typeAnnotation, visitor)

        visitor[NodeType.ObjectPattern]?.(node)
      })

    case NodeType.PrivateIdentifier:
      return visit(node, (node) => {
        visitor[NodeType.PrivateIdentifier]?.(node)
      })

    case NodeType.Program:
      return visit(node, (node) => {
        node.body.forEach((node) => traverse(node, visitor))

        visitor[NodeType.Program]?.(node)
      })

    case NodeType.Property:
      return visit(node, (node) => {
        traverse(node.key, visitor)
        traverse(node.value, visitor)

        visitor[NodeType.Property]?.(node)
      })

    case NodeType.PropertyDefinition:
      return visit(node, (node) => {
        traverse(node.key, visitor)
        node.value && traverse(node.value, visitor)

        node.decorators.forEach((node) => traverse(node, visitor))
        node.typeAnnotation && traverse(node.typeAnnotation, visitor)

        visitor[NodeType.PropertyDefinition]?.(node)
      })

    case NodeType.RestElement:
      return visit(node, (node) => {
        traverse(node.argument, visitor)

        node.decorators.forEach((node) => traverse(node, visitor))
        node.typeAnnotation && traverse(node.typeAnnotation, visitor)

        visitor[NodeType.RestElement]?.(node)
      })

    case NodeType.ReturnStatement:
      return visit(node, (node) => {
        node.argument && traverse(node.argument, visitor)

        visitor[NodeType.ReturnStatement]?.(node)
      })

    case NodeType.SequenceExpression:
      return visit(node, (node) => {
        node.expressions.forEach((node) => traverse(node, visitor))

        visitor[NodeType.SequenceExpression]?.(node)
      })

    case NodeType.SpreadElement:
      return visit(node, (node) => {
        traverse(node.argument, visitor)

        visitor[NodeType.SpreadElement]?.(node)
      })

    case NodeType.StaticBlock:
      return visit(node, (node) => {
        node.body.forEach((node) => traverse(node, visitor))

        visitor[NodeType.StaticBlock]?.(node)
      })

    case NodeType.Super:
      return visit(node, (node) => {
        visitor[NodeType.Super]?.(node)
      })

    case NodeType.SwitchCase:
      return visit(node, (node) => {
        node.test && traverse(node.test, visitor)
        node.consequent.forEach((node) => traverse(node, visitor))

        visitor[NodeType.SwitchCase]?.(node)
      })

    case NodeType.SwitchStatement:
      return visit(node, (node) => {
        traverse(node.discriminant, visitor)
        node.cases.forEach((node) => traverse(node, visitor))

        visitor[NodeType.SwitchStatement]?.(node)
      })

    case NodeType.TaggedTemplateExpression:
      return visit(node, (node) => {
        traverse(node.tag, visitor)
        traverse(node.quasi, visitor)

        node.typeArguments && traverse(node.typeArguments, visitor)
        visitor[NodeType.TaggedTemplateExpression]?.(node)
      })

    case NodeType.TemplateElement:
      return visit(node, (node) => {
        visitor[NodeType.TemplateElement]?.(node)
      })

    case NodeType.TemplateLiteral:
      return visit(node, (node) => {
        node.quasis.forEach((node) => traverse(node, visitor))
        node.expressions.forEach((node) => traverse(node, visitor))

        visitor[NodeType.TemplateLiteral]?.(node)
      })

    case NodeType.ThisExpression:
      return visit(node, (node) => {
        visitor[NodeType.ThisExpression]?.(node)
      })

    case NodeType.ThrowStatement:
      return visit(node, (node) => {
        traverse(node.argument, visitor)

        visitor[NodeType.ThrowStatement]?.(node)
      })

    case NodeType.TryStatement:
      return visit(node, (node) => {
        traverse(node.block, visitor)

        node.handler && traverse(node.handler, visitor)
        node.finalizer && traverse(node.finalizer, visitor)

        visitor[NodeType.TryStatement]?.(node)
      })

    case NodeType.UnaryExpression:
      return visit(node, (node) => {
        traverse(node.argument, visitor)

        visitor[NodeType.UnaryExpression]?.(node)
      })

    case NodeType.UpdateExpression:
      return visit(node, (node) => {
        traverse(node.argument, visitor)

        visitor[NodeType.UpdateExpression]?.(node)
      })

    case NodeType.VariableDeclaration:
      return visit(node, (node) => {
        node.declarations.forEach((node) => traverse(node, visitor))

        visitor[NodeType.VariableDeclaration]?.(node)
      })

    case NodeType.VariableDeclarator:
      return visit(node, (node) => {
        traverse(node.id, visitor)

        node.init && traverse(node.init, visitor)

        visitor[NodeType.VariableDeclarator]?.(node)
      })

    case NodeType.WhileStatement:
      return visit(node, (node) => {
        traverse(node.test, visitor)
        traverse(node.body, visitor)

        visitor[NodeType.WhileStatement]?.(node)
      })

    case NodeType.WithStatement:
      return visit(node, (node) => {
        traverse(node.object, visitor)
        traverse(node.body, visitor)

        visitor[NodeType.WithStatement]?.(node)
      })

    case NodeType.YieldExpression:
      return visit(node, (node) => {
        node.argument && traverse(node.argument, visitor)

        visitor[NodeType.YieldExpression]?.(node)
      })

    case NodeType.TSAbstractAccessorProperty:
      return visit(node, (node) => {
        traverse(node.key, visitor)

        node.decorators.forEach((node) => traverse(node, visitor))
        node.typeAnnotation && traverse(node.typeAnnotation, visitor)

        visitor[NodeType.TSAbstractAccessorProperty]?.(node)
      })

    case NodeType.TSAbstractKeyword:
      return visit(node, (node) => {
        visitor[NodeType.TSAbstractKeyword]?.(node)
      })

    case NodeType.TSAbstractMethodDefinition:
      return visit(node, (node) => {
        traverse(node.key, visitor)
        traverse(node.value, visitor)

        node.decorators.forEach((node) => traverse(node, visitor))

        visitor[NodeType.TSAbstractMethodDefinition]?.(node)
      })

    case NodeType.TSAbstractPropertyDefinition:
      return visit(node, (node) => {
        traverse(node.key, visitor)

        node.decorators.forEach((node) => traverse(node, visitor))
        node.typeAnnotation && traverse(node.typeAnnotation, visitor)

        visitor[NodeType.TSAbstractPropertyDefinition]?.(node)
      })

    case NodeType.TSAnyKeyword:
      return visit(node, (node) => {
        visitor[NodeType.TSAnyKeyword]?.(node)
      })

    case NodeType.TSArrayType:
      return visit(node, (node) => {
        node.elementType && traverse(node.elementType, visitor)

        visitor[NodeType.TSArrayType]?.(node)
      })

    case NodeType.TSAsExpression:
      return visit(node, (node) => {
        traverse(node.expression, visitor)
        traverse(node.typeAnnotation, visitor)

        visitor[NodeType.TSAsExpression]?.(node)
      })

    case NodeType.TSAsyncKeyword:
      return visit(node, (node) => {
        visitor[NodeType.TSAsyncKeyword]?.(node)
      })

    case NodeType.TSBigIntKeyword:
      return visit(node, (node) => {
        visitor[NodeType.TSBigIntKeyword]?.(node)
      })

    case NodeType.TSBooleanKeyword:
      return visit(node, (node) => {
        visitor[NodeType.TSBooleanKeyword]?.(node)
      })

    case NodeType.TSCallSignatureDeclaration:
      return visit(node, (node) => {
        node.params.forEach((node) => traverse(node, visitor))

        node.typeParameters && traverse(node.typeParameters, visitor)
        node.returnType && traverse(node.returnType, visitor)

        visitor[NodeType.TSCallSignatureDeclaration]?.(node)
      })

    case NodeType.TSClassImplements:
      return visit(node, (node) => {
        traverse(node.expression, visitor)

        node.typeArguments && traverse(node.typeArguments, visitor)

        visitor[NodeType.TSClassImplements]?.(node)
      })

    case NodeType.TSConditionalType:
      return visit(node, (node) => {
        traverse(node.checkType, visitor)
        traverse(node.extendsType, visitor)
        traverse(node.trueType, visitor)
        traverse(node.falseType, visitor)

        visitor[NodeType.TSConditionalType]?.(node)
      })

    case NodeType.TSConstructorType:
      return visit(node, (node) => {
        node.params.forEach((node) => traverse(node, visitor))

        node.typeParameters && traverse(node.typeParameters, visitor)
        node.returnType && traverse(node.returnType, visitor)

        visitor[NodeType.TSConstructorType]?.(node)
      })

    case NodeType.TSConstructSignatureDeclaration:
      return visit(node, (node) => {
        node.params.forEach((node) => traverse(node, visitor))

        node.typeParameters && traverse(node.typeParameters, visitor)
        node.returnType && traverse(node.returnType, visitor)

        visitor[NodeType.TSConstructSignatureDeclaration]?.(node)
      })

    case NodeType.TSDeclareFunction:
      return visit(node, (node) => {
        node.id && traverse(node.id, visitor)
        node.params.forEach((node) => traverse(node, visitor))

        node.typeParameters && traverse(node.typeParameters, visitor)
        node.returnType && traverse(node.returnType, visitor)

        visitor[NodeType.TSDeclareFunction]?.(node)
      })

    case NodeType.TSDeclareKeyword:
      return visit(node, (node) => {
        visitor[NodeType.TSDeclareKeyword]?.(node)
      })

    case NodeType.TSEmptyBodyFunctionExpression:
      return visit(node, (node) => {
        node.params.forEach((node) => traverse(node, visitor))

        node.typeParameters && traverse(node.typeParameters, visitor)
        node.returnType && traverse(node.returnType, visitor)

        visitor[NodeType.TSEmptyBodyFunctionExpression]?.(node)
      })

    case NodeType.TSEnumBody:
      return visit(node, (node) => {
        node.members.forEach((node) => traverse(node, visitor))

        visitor[NodeType.TSEnumBody]?.(node)
      })

    case NodeType.TSEnumDeclaration:
      return visit(node, (node) => {
        traverse(node.id, visitor)
        traverse(node.body, visitor)

        visitor[NodeType.TSEnumDeclaration]?.(node)
      })

    case NodeType.TSEnumMember:
      return visit(node, (node) => {
        traverse(node.id, visitor)

        node.initializer && traverse(node.initializer, visitor)

        visitor[NodeType.TSEnumMember]?.(node)
      })

    case NodeType.TSExportAssignment:
      return visit(node, (node) => {
        traverse(node.expression, visitor)

        visitor[NodeType.TSExportAssignment]?.(node)
      })

    case NodeType.TSExportKeyword:
      return visit(node, (node) => {
        visitor[NodeType.TSExportKeyword]?.(node)
      })

    case NodeType.TSExternalModuleReference:
      return visit(node, (node) => {
        traverse(node.expression, visitor)

        visitor[NodeType.TSExternalModuleReference]?.(node)
      })

    case NodeType.TSFunctionType:
      return visit(node, (node) => {
        node.params.forEach((node) => traverse(node, visitor))

        node.typeParameters && traverse(node.typeParameters, visitor)
        node.returnType && traverse(node.returnType, visitor)

        visitor[NodeType.TSFunctionType]?.(node)
      })

    case NodeType.TSImportEqualsDeclaration:
      return visit(node, (node) => {
        traverse(node.id, visitor)
        traverse(node.moduleReference, visitor)

        visitor[NodeType.TSImportEqualsDeclaration]?.(node)
      })

    case NodeType.TSImportType:
      return visit(node, (node) => {
        traverse(node.argument, visitor)

        node.qualifier && traverse(node.qualifier, visitor)

        node.options && traverse(node.options, visitor)
        node.typeArguments && traverse(node.typeArguments, visitor)

        visitor[NodeType.TSImportType]?.(node)
      })

    case NodeType.TSIndexedAccessType:
      return visit(node, (node) => {
        traverse(node.indexType, visitor)
        traverse(node.objectType, visitor)

        visitor[NodeType.TSIndexedAccessType]?.(node)
      })

    case NodeType.TSIndexSignature:
      return visit(node, (node) => {
        node.parameters.forEach((node) => traverse(node, visitor))

        node.typeAnnotation && traverse(node.typeAnnotation, visitor)

        visitor[NodeType.TSIndexSignature]?.(node)
      })

    case NodeType.TSInferType:
      return visit(node, (node) => {
        traverse(node.typeParameter, visitor)

        visitor[NodeType.TSInferType]?.(node)
      })

    case NodeType.TSInstantiationExpression:
      return visit(node, (node) => {
        traverse(node.expression, visitor)

        node.typeArguments && traverse(node.typeArguments, visitor)

        visitor[NodeType.TSInstantiationExpression]?.(node)
      })

    case NodeType.TSInterfaceBody:
      return visit(node, (node) => {
        node.body.forEach((node) => traverse(node, visitor))

        visitor[NodeType.TSInterfaceBody]?.(node)
      })

    case NodeType.TSInterfaceDeclaration:
      return visit(node, (node) => {
        traverse(node.id, visitor)
        traverse(node.body, visitor)

        node.typeParameters && traverse(node.typeParameters, visitor)

        visitor[NodeType.TSInterfaceDeclaration]?.(node)
      })

    case NodeType.TSInterfaceHeritage:
      return visit(node, (node) => {
        traverse(node.expression, visitor)

        node.typeArguments && traverse(node.typeArguments, visitor)

        visitor[NodeType.TSInterfaceHeritage]?.(node)
      })

    case NodeType.TSIntersectionType:
      return visit(node, (node) => {
        node.types.forEach((node) => traverse(node, visitor))

        visitor[NodeType.TSIntersectionType]?.(node)
      })

    case NodeType.TSIntrinsicKeyword:
      return visit(node, (node) => {
        visitor[NodeType.TSIntrinsicKeyword]?.(node)
      })

    case NodeType.TSLiteralType:
      return visit(node, (node) => {
        traverse(node.literal, visitor)

        visitor[NodeType.TSLiteralType]?.(node)
      })

    case NodeType.TSMappedType:
      return visit(node, (node) => {
        traverse(node.key, visitor)
        traverse(node.constraint, visitor)

        node.nameType && traverse(node.nameType, visitor)
        node.typeAnnotation && traverse(node.typeAnnotation, visitor)

        visitor[NodeType.TSMappedType]?.(node)
      })

    case NodeType.TSMethodSignature:
      return visit(node, (node) => {
        traverse(node.key, visitor)

        node.params.forEach((node) => traverse(node, visitor))

        node.typeParameters && traverse(node.typeParameters, visitor)
        node.returnType && traverse(node.returnType, visitor)

        visitor[NodeType.TSMethodSignature]?.(node)
      })

    case NodeType.TSModuleBlock:
      return visit(node, (node) => {
        node.body.forEach((node) => traverse(node, visitor))

        visitor[NodeType.TSModuleBlock]?.(node)
      })

    case NodeType.TSModuleDeclaration:
      return visit(node, (node) => {
        traverse(node.id, visitor)

        node.body && traverse(node.body, visitor)

        visitor[NodeType.TSModuleDeclaration]?.(node)
      })

    case NodeType.TSNamedTupleMember:
      return visit(node, (node) => {
        traverse(node.label, visitor)
        traverse(node.elementType, visitor)

        visitor[NodeType.TSNamedTupleMember]?.(node)
      })

    case NodeType.TSNamespaceExportDeclaration:
      return visit(node, (node) => {
        traverse(node.id, visitor)

        visitor[NodeType.TSNamespaceExportDeclaration]?.(node)
      })

    case NodeType.TSNeverKeyword:
      return visit(node, (node) => {
        visitor[NodeType.TSNeverKeyword]?.(node)
      })

    case NodeType.TSNonNullExpression:
      return visit(node, (node) => {
        traverse(node.expression, visitor)

        visitor[NodeType.TSNonNullExpression]?.(node)
      })

    case NodeType.TSNullKeyword:
      return visit(node, (node) => {
        visitor[NodeType.TSNullKeyword]?.(node)
      })

    case NodeType.TSNumberKeyword:
      return visit(node, (node) => {
        visitor[NodeType.TSNumberKeyword]?.(node)
      })

    case NodeType.TSObjectKeyword:
      return visit(node, (node) => {
        visitor[NodeType.TSObjectKeyword]?.(node)
      })

    case NodeType.TSOptionalType:
      return visit(node, (node) => {
        node.typeAnnotation && traverse(node.typeAnnotation, visitor)

        visitor[NodeType.TSOptionalType]?.(node)
      })

    case NodeType.TSParameterProperty:
      return visit(node, (node) => {
        traverse(node.parameter, visitor)

        node.decorators.forEach((node) => traverse(node, visitor))

        visitor[NodeType.TSParameterProperty]?.(node)
      })

    case NodeType.TSPrivateKeyword:
      return visit(node, (node) => {
        visitor[NodeType.TSPrivateKeyword]?.(node)
      })

    case NodeType.TSPropertySignature:
      return visit(node, (node) => {
        traverse(node.key, visitor)

        node.typeAnnotation && traverse(node.typeAnnotation, visitor)

        visitor[NodeType.TSPropertySignature]?.(node)
      })

    case NodeType.TSProtectedKeyword:
      return visit(node, (node) => {
        visitor[NodeType.TSProtectedKeyword]?.(node)
      })

    case NodeType.TSPublicKeyword:
      return visit(node, (node) => {
        visitor[NodeType.TSPublicKeyword]?.(node)
      })

    case NodeType.TSQualifiedName:
      return visit(node, (node) => {
        traverse(node.left, visitor)
        traverse(node.right, visitor)

        visitor[NodeType.TSQualifiedName]?.(node)
      })

    case NodeType.TSReadonlyKeyword:
      return visit(node, (node) => {
        visitor[NodeType.TSReadonlyKeyword]?.(node)
      })

    case NodeType.TSRestType:
      return visit(node, (node) => {
        traverse(node.typeAnnotation, visitor)

        visitor[NodeType.TSRestType]?.(node)
      })

    case NodeType.TSSatisfiesExpression:
      return visit(node, (node) => {
        traverse(node.expression, visitor)
        traverse(node.typeAnnotation, visitor)

        visitor[NodeType.TSSatisfiesExpression]?.(node)
      })

    case NodeType.TSStaticKeyword:
      return visit(node, (node) => {
        visitor[NodeType.TSStaticKeyword]?.(node)
      })

    case NodeType.TSStringKeyword:
      return visit(node, (node) => {
        visitor[NodeType.TSStringKeyword]?.(node)
      })

    case NodeType.TSSymbolKeyword:
      return visit(node, (node) => {
        visitor[NodeType.TSSymbolKeyword]?.(node)
      })

    case NodeType.TSTemplateLiteralType:
      return visit(node, (node) => {
        node.quasis.forEach((node) => traverse(node, visitor))
        node.types.forEach((node) => traverse(node, visitor))

        visitor[NodeType.TSTemplateLiteralType]?.(node)
      })

    case NodeType.TSThisType:
      return visit(node, (node) => {
        visitor[NodeType.TSThisType]?.(node)
      })

    case NodeType.TSTupleType:
      return visit(node, (node) => {
        node.elementTypes.forEach((node) => traverse(node, visitor))

        visitor[NodeType.TSTupleType]?.(node)
      })

    case NodeType.TSTypeAliasDeclaration:
      return visit(node, (node) => {
        traverse(node.id, visitor)

        node.typeParameters && traverse(node.typeParameters, visitor)

        traverse(node.typeAnnotation, visitor)

        visitor[NodeType.TSTypeAliasDeclaration]?.(node)
      })

    case NodeType.TSTypeAnnotation:
      return visit(node, (node) => {
        traverse(node.typeAnnotation, visitor)

        visitor[NodeType.TSTypeAnnotation]?.(node)
      })

    case NodeType.TSTypeAssertion:
      return visit(node, (node) => {
        traverse(node.expression, visitor)
        traverse(node.typeAnnotation, visitor)

        visitor[NodeType.TSTypeAssertion]?.(node)
      })

    case NodeType.TSTypeLiteral:
      return visit(node, (node) => {
        node.members.forEach((node) => traverse(node, visitor))

        visitor[NodeType.TSTypeLiteral]?.(node)
      })

    case NodeType.TSTypeOperator:
      return visit(node, (node) => {
        node.typeAnnotation && traverse(node.typeAnnotation, visitor)

        visitor[NodeType.TSTypeOperator]?.(node)
      })

    case NodeType.TSTypeParameter:
      return visit(node, (node) => {
        traverse(node.name, visitor)

        node.constraint && traverse(node.constraint, visitor)
        node.default && traverse(node.default, visitor)

        visitor[NodeType.TSTypeParameter]?.(node)
      })

    case NodeType.TSTypeParameterDeclaration:
      return visit(node, (node) => {
        node.params.forEach((node) => traverse(node, visitor))

        visitor[NodeType.TSTypeParameterDeclaration]?.(node)
      })

    case NodeType.TSTypeParameterInstantiation:
      return visit(node, (node) => {
        node.params.forEach((node) => traverse(node, visitor))

        visitor[NodeType.TSTypeParameterInstantiation]?.(node)
      })

    case NodeType.TSTypePredicate:
      return visit(node, (node) => {
        traverse(node.parameterName, visitor)

        node.typeAnnotation && traverse(node.typeAnnotation, visitor)

        visitor[NodeType.TSTypePredicate]?.(node)
      })

    case NodeType.TSTypeQuery:
      return visit(node, (node) => {
        traverse(node.exprName, visitor)

        node.typeArguments && traverse(node.typeArguments, visitor)

        visitor[NodeType.TSTypeQuery]?.(node)
      })

    case NodeType.TSTypeReference:
      return visit(node, (node) => {
        traverse(node.typeName, visitor)

        node.typeArguments && traverse(node.typeArguments, visitor)

        visitor[NodeType.TSTypeReference]?.(node)
      })

    case NodeType.TSUndefinedKeyword:
      return visit(node, (node) => {
        visitor[NodeType.TSUndefinedKeyword]?.(node)
      })

    case NodeType.TSUnionType:
      return visit(node, (node) => {
        node.types.forEach((node) => traverse(node, visitor))

        visitor[NodeType.TSUnionType]?.(node)
      })

    case NodeType.TSUnknownKeyword:
      return visit(node, (node) => {
        visitor[NodeType.TSUnknownKeyword]?.(node)
      })

    case NodeType.TSVoidKeyword:
      return visit(node, (node) => {
        visitor[NodeType.TSVoidKeyword]?.(node)
      })
  }
}

interface DefaultExport {
  type: 'default'
  declaration: ts.ExportDefaultDeclaration
}

interface NamedExport {
  type: 'named'
  name: string
  declaration: ts.ExportNamedDeclaration
}

interface AllExport {
  type: 'all'
  declaration: ts.ExportAllDeclaration
}

type Export = DefaultExport | NamedExport | AllExport

export function getExports(node: ts.Node): Export[] {
  const exports: Export[] = []

  function traversePattern(
    declaration: ts.ExportNamedDeclaration,
    pattern: ts.DestructuringPattern | null
  ) {
    if (pattern === null) {
      return
    }

    switch (pattern?.type) {
      case NodeType.ArrayPattern:
        pattern.elements.map((element) => traversePattern(declaration, element))
        break

      case NodeType.ObjectPattern:
        pattern.properties.map((property) =>
          traverseProperty(declaration, property)
        )
        break

      case NodeType.AssignmentPattern:
        traversePattern(declaration, pattern.left)
        break

      case NodeType.Identifier:
        exports.push({
          type: 'named',
          name: pattern.name,
          declaration,
        })
        break

      // I have no idea what kind of destructuring this is. A MemberExpression means
      // that you are accessing a property, i.e. a.c or a['c']. I'll just ignore it.
      case NodeType.MemberExpression:
        break

      case NodeType.RestElement:
        traversePattern(declaration, pattern.argument)
        break

      default:
        return exhaustive(pattern)
    }
  }

  function traverseProperty(
    declaration: ts.ExportNamedDeclaration,
    node: ts.Property | ts.RestElement
  ) {
    switch (node.type) {
      case NodeType.RestElement:
        traversePattern(declaration, node.argument)
        break

      case NodeType.Property:
        if (node.value.type === NodeType.Identifier) {
          exports.push({
            type: 'named',
            name: node.value.name,
            declaration,
          })
        }

        if (
          node.value.type === NodeType.ObjectPattern ||
          node.value.type === NodeType.ArrayPattern ||
          node.value.type === NodeType.AssignmentPattern ||
          node.value.type === NodeType.MemberExpression
        ) {
          traversePattern(declaration, node.value)
        }
        break

      default:
        return exhaustive(node)
    }
  }

  function traverseBindingName(
    declaration: ts.ExportNamedDeclaration,
    node: ts.BindingName
  ) {
    switch (node.type) {
      case NodeType.Identifier:
        exports.push({
          type: 'named',
          name: node.name,
          declaration,
        })
        break

      case NodeType.ArrayPattern:
        node.elements.map((element) => traversePattern(declaration, element))
        break

      case NodeType.ObjectPattern:
        node.properties.map((element) => traverseProperty(declaration, element))
        break
    }
  }

  traverse(node, {
    [NodeType.ExportDefaultDeclaration](node) {
      exports.push({ type: 'default', declaration: node })
    },
    [NodeType.ExportNamedDeclaration](node) {
      const { declaration, specifiers } = node

      if (declaration !== null) {
        switch (declaration.type) {
          case NodeType.FunctionDeclaration:
          case NodeType.ClassDeclaration:
            exports.push({
              type: 'named',
              name: declaration.id?.name ?? '',
              declaration: node,
            })
            break

          case NodeType.VariableDeclaration:
            for (const variable of declaration.declarations) {
              traverseBindingName(node, variable.id)
            }
            break

          // Ignore typescript for now.
          case NodeType.TSInterfaceDeclaration:
          case NodeType.TSTypeAliasDeclaration:
          case NodeType.TSEnumDeclaration:
          case NodeType.TSModuleDeclaration:
          case NodeType.TSDeclareFunction:
          case NodeType.TSImportEqualsDeclaration:
            break

          default:
            return exhaustive(declaration)
        }
      }

      for (const specifier of specifiers) {
        exports.push({
          type: 'named',
          name:
            specifier.exported.type === NodeType.Identifier
              ? specifier.exported.name
              : specifier.exported.value,
          declaration: node,
        })
      }
    },
    [NodeType.ExportAllDeclaration](node) {
      exports.push({ type: 'all', declaration: node })
    },
  })

  return exports
}
