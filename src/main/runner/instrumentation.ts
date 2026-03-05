import { parse } from '@typescript-eslint/typescript-estree'
import { generate } from 'astring'
import path from 'path'

import { baseProps, NodeType } from '@/codegen/estree/nodes'
import { traverse } from '@/codegen/estree/traverse'
import { makeRelativePath } from '@/utils/fs/path'
import { readResource } from '@/utils/resources'

interface InstrumentScriptOptions {
  entryScript: string
  replayScript: string
  entryPath: string
  scriptPath: string
}

const parseScript = (input: string) => {
  return parse(input, {
    loc: true,
    range: true,
  })
}

export const instrumentScript = ({
  entryScript,
  replayScript,
  entryPath,
  scriptPath,
}: InstrumentScriptOptions) => {
  const entryAst = parseScript(entryScript)

  if (entryAst === undefined) {
    throw new Error('Failed to parse entry script')
  }

  // Use relative import path from entry script's directory
  const entryDir = path.dirname(entryPath)
  const relativePath = makeRelativePath(entryDir, scriptPath)

  traverse(entryAst, {
    [NodeType.ImportDeclaration](node) {
      if (node.source.value === '__USER_SCRIPT_PATH__') {
        node.source.value = relativePath
        node.source.raw = JSON.stringify(relativePath)
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

export const instrumentScriptFromPath = async (
  entryPath: string,
  scriptPath: string
) => {
  const entryScript = await readResource('entrypoint-script')
  const replayScript = await readResource('replay-script')

  return instrumentScript({
    entryScript,
    replayScript,
    entryPath,
    scriptPath,
  })
}
