import { TSESTree as ts } from '@typescript-eslint/typescript-estree'

// Since we're generating our own AST we don't have any positional information, but
// the types require it. To fix it, we spread this dummy object into the nodes we create.
export const baseProps = {
  loc: null as unknown as ts.SourceLocation,
  range: null as unknown as ts.Range,
  // The type definitions require us to set a parent, but we don't have one so we force
  // it to null. Prettier seems to be totally fine with this. The `any` is to work around
  // some types narrowing the parent type to a specific node type, e.g. the parent of an
  // `ImportSpecifier` must be an `ImportDeclaration`.
  //
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
  parent: null as unknown as any,
}

export const NodeType = ts.AST_NODE_TYPES
