import { TSESTree as ts } from '@typescript-eslint/types'

import { baseProps, NodeType } from './nodes'
import { NodeOptions } from './types'

export function importDeclaration({
  importKind = 'value',
  attributes = [],
  source,
  specifiers,
}: NodeOptions<
  ts.ImportDeclaration,
  'source' | 'specifiers',
  'assertions'
>): ts.ImportDeclaration {
  return {
    ...baseProps,
    type: NodeType.ImportDeclaration,
    assertions: [],
    importKind,
    attributes,
    source,
    specifiers,
  }
}

export function defaultImport({
  local,
}: NodeOptions<ts.ImportDefaultSpecifier, 'local'>): ts.ImportDefaultSpecifier {
  return {
    ...baseProps,
    type: NodeType.ImportDefaultSpecifier,
    local,
  }
}

export function namedImport({
  imported,
  local,
  importKind = 'value',
}: NodeOptions<ts.ImportSpecifier, 'imported'>): ts.ImportSpecifier {
  return {
    ...baseProps,
    type: NodeType.ImportSpecifier,
    imported,
    // @ts-expect-error - We allow this to be undefined, so that we don't get `import { abd as abc } from 'module'`.
    local,
    importKind,
  }
}

export function exportNamed({
  exportKind = 'value',
  declaration,
}: NodeOptions<
  ts.ExportNamedDeclarationWithoutSourceWithSingle,
  'declaration'
>): ts.ExportNamedDeclarationWithoutSourceWithSingle {
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
}: NodeOptions<
  ts.ExportDefaultDeclaration,
  'declaration'
>): ts.ExportDefaultDeclaration {
  return {
    ...baseProps,
    type: NodeType.ExportDefaultDeclaration,
    declaration,
    exportKind: 'value',
  }
}
