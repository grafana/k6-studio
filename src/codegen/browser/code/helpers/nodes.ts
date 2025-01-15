import { AST_NODE_TYPES, SourceLocation, Range } from '../../tstree'

// Since we're generating our own AST we don't have any positional information, but
// the types require it. To fix it, we spread this dummy object into the nodes we create.
export const baseProps = {
  loc: null as unknown as SourceLocation,
  range: null as unknown as Range,
}

export const NodeType = AST_NODE_TYPES
