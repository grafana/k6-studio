import { parse } from '@typescript-eslint/typescript-estree'
import { generate } from 'astring'
import { app } from 'electron'
import { readFile } from 'fs/promises'
import path from 'path'

import { NodeType } from '@/codegen/estree/nodes'
import { traverse } from '@/codegen/estree/traverse'

interface InstrumentScriptOptions {
  entryScript: string
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
  scriptPath,
}: InstrumentScriptOptions) => {
  const entryAst = parseScript(entryScript)

  if (entryAst === undefined) {
    throw new Error('Failed to parse entry script')
  }

  // Use relative import path with ./ prefix for cross-platform compatibility
  const scriptBasename = path.basename(scriptPath)
  const relativePath = `./${scriptBasename}`

  traverse(entryAst, {
    [NodeType.ImportDeclaration](node) {
      if (node.source.value === '__USER_SCRIPT_PATH__') {
        node.source.value = relativePath
        node.source.raw = JSON.stringify(relativePath)
      }
    },
  })

  return generate(entryAst)
}

export const instrumentScriptFromPath = async (scriptPath: string) => {
  // @ts-expect-error We are targeting CommonJS so import.meta is not available
  const entryScriptPath = !import.meta.env.PROD
    ? path.join(app.getAppPath(), 'resources', 'entrypoint.js')
    : path.join(process.resourcesPath, 'entrypoint.js')

  const entryScript = await readFile(entryScriptPath, { encoding: 'utf-8' })

  return instrumentScript({
    entryScript,
    scriptPath,
  })
}
