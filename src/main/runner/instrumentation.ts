import { parse } from '@typescript-eslint/typescript-estree'
import { generate } from 'astring'
import { app } from 'electron'
import { readFile } from 'fs/promises'
import path from 'path'

import {
  constDeclarator,
  declareConst,
  exportNamed,
  fromObjectLiteral,
  identifier,
} from '@/codegen/estree'
import { NodeType } from '@/codegen/estree/nodes'
import { getExports, traverse } from '@/codegen/estree/traverse'

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

export const instrumentScript = async ({
  entryScript,
  scriptPath,
}: InstrumentScriptOptions) => {
  const entryAst = parseScript(entryScript)

  if (entryAst === undefined) {
    throw new Error('Failed to parse entry script')
  }

  const userScriptContent = await readFile(scriptPath, {
    encoding: 'utf-8',
  })
  const userScriptAst = parseScript(userScriptContent)

  if (userScriptAst === undefined) {
    throw new Error('Failed to parse user script')
  }

  let isBrowserTest = false

  traverse(userScriptAst, {
    [NodeType.ImportDeclaration](node) {
      if (node.source.value === 'k6/browser') {
        isBrowserTest = true
      }
    },
  })

  traverse(entryAst, {
    [NodeType.ImportDeclaration](node) {
      if (node.source.value === '__USER_SCRIPT_PATH__') {
        node.source.value = scriptPath
        node.source.raw = JSON.stringify(scriptPath)
      }
    },
  })

  // Update options export based on whether it's a browser test
  const exports = getExports(entryAst)

  const optionsExport = exports.find(
    (e) => e.type === 'named' && e.name === 'options'
  )

  if (optionsExport) {
    traverse(entryAst, {
      [NodeType.Identifier](node) {
        if (node.name === 'options') {
          // It's easier to just rename the options export than to
          // remove the node itself. This is just some UUID that I
          // generated. Should be pretty unique.
          node.name = '$c26e2908c2e948ef883369abc050ce2f'
        }
      },
    })
  }

  const browserOptions = isBrowserTest
    ? {
        options: fromObjectLiteral({
          browser: fromObjectLiteral({
            type: 'chromium',
          }),
        }),
      }
    : null

  const options = fromObjectLiteral({
    scenarios: fromObjectLiteral({
      default: fromObjectLiteral({
        executor: 'shared-iterations',
        vus: 1,
        iterations: 1,
        ...browserOptions,
      }),
    }),
  })

  entryAst.body.push(
    exportNamed({
      declaration: declareConst({
        declarations: [
          constDeclarator({
            id: identifier('options'),
            init: options,
          }),
        ],
      }),
    })
  )

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
