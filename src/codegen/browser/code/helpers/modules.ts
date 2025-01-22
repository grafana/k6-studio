import {
  ImportDeclaration,
  ExportDefaultDeclaration,
  ExportNamedDeclarationWithoutSourceWithSingle,
  ImportDefaultSpecifier,
  ImportSpecifier,
} from '../../tstree'
import { baseProps, NodeType } from './nodes'
import { NodeOptions } from './types'

export function importDeclaration({
  importKind = 'value',
  attributes = [],
  source,
  specifiers,
}: NodeOptions<
  ImportDeclaration,
  'source' | 'specifiers',
  'assertions'
>): ImportDeclaration {
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
}: NodeOptions<ImportDefaultSpecifier, 'local'>): ImportDefaultSpecifier {
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
}: NodeOptions<ImportSpecifier, 'imported'>): ImportSpecifier {
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
  ExportNamedDeclarationWithoutSourceWithSingle,
  'declaration'
>): ExportNamedDeclarationWithoutSourceWithSingle {
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
  ExportDefaultDeclaration,
  'declaration'
>): ExportDefaultDeclaration {
  return {
    ...baseProps,
    type: NodeType.ExportDefaultDeclaration,
    declaration,
    exportKind: 'value',
  }
}
