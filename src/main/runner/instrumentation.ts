import { parse, TSESTree as ts } from '@typescript-eslint/typescript-estree'
import { generate } from 'astring'

import { baseProps, NodeType } from '@/codegen/estree/nodes'
import { traverse } from '@/codegen/estree/traverse'
import { readResource } from '@/utils/resources'

interface InstrumentScriptOptions {
  entryScript: string
  replayScript: string
  scriptPath: string
}

const parseScript = (input: string) => {
  return parse(input, {
    loc: true,
    range: true,
  })
}

export function replaceModules(
  script: ts.Program | string,
  replacements: Record<string, string>
) {
  const ast = typeof script === 'string' ? parseScript(script) : script

  if (ast === undefined) {
    throw new Error('Failed to parse script for import replacement')
  }

  traverse(ast, {
    [NodeType.ImportDeclaration](node) {
      const replacement = replacements[node.source.value]

      if (replacement) {
        node.source.value = replacement
        node.source.raw = JSON.stringify(replacement)
      }
    },
    [NodeType.ExportAllDeclaration](node) {
      if (node.source) {
        const replacement = replacements[node.source.value]

        if (replacement) {
          node.source.value = replacement
          node.source.raw = JSON.stringify(replacement)
        }
      }
    },
    [NodeType.ExportNamedDeclaration](node) {
      if (node.source) {
        const replacement = replacements[node.source.value]

        if (replacement) {
          node.source.value = replacement
          node.source.raw = JSON.stringify(replacement)
        }
      }
    },
  })

  return generate(ast)
}

export const instrumentScript = ({
  entryScript,
  replayScript,
  scriptPath,
}: InstrumentScriptOptions) => {
  const entryAst = parseScript(entryScript)

  if (entryAst === undefined) {
    throw new Error('Failed to parse entry script')
  }

  traverse(entryAst, {
    [NodeType.ImportDeclaration](node) {
      if (node.source.value === '__USER_SCRIPT_PATH__') {
        node.source.value = scriptPath
        node.source.raw = JSON.stringify(scriptPath)
      }
    },
    [NodeType.VariableDeclarator](node) {
      if (
        node.id.type === NodeType.Identifier &&
        node.id.name === 'SESSION_REPLAY_SCRIPT'
      ) {
        node.init = {
          ...baseProps,
          type: NodeType.Literal,
          value: replayScript,
          raw: JSON.stringify(replayScript),
        }
      }
    },
  })

  return generate(entryAst)
}

export const instrumentScriptFromPath = async (scriptPath: string) => {
  const entryScript = await readResource('entrypoint-script')
  const replayScript = await readResource('replay-script')

  return instrumentScript({
    entryScript,
    replayScript,
    scriptPath,
  })
}
