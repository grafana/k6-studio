import { parse, TSESTree as ts } from '@typescript-eslint/typescript-estree'
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
  script: string
  shims: {
    group: string
    checks: string
  }
}

const parseScript = (input: string) => {
  return parse(input, {
    loc: true,
    range: true,
  })
}

export const instrumentScript = async ({
  script,
  shims,
}: InstrumentScriptOptions) => {
  const browserShim = getShimPath('browser.js')

  const [groupAst, checksAst, scriptAst] = await Promise.all([
    parseScript(shims.group),
    parseScript(shims.checks),
    parseScript(script),
  ])

  if (groupAst === undefined) {
    throw new Error('Failed to parse group snippet')
  }

  if (checksAst === undefined) {
    throw new Error('Failed to parse checks snippet')
  }

  if (scriptAst === undefined) {
    throw new Error('Failed to parse script content')
  }

  let browserImport: ts.ImportDeclaration | null = null
  let httpImport: ts.ImportDeclaration | null = null

  traverse(scriptAst, {
    [NodeType.ImportDeclaration](node) {
      switch (node.source.value) {
        case 'k6/http':
          httpImport = node
          break

        case 'k6/browser':
          browserImport = node

          // Replace the import source with our shim path.
          browserImport.source.value = browserShim
          browserImport.source.raw = JSON.stringify(browserShim)

          break
      }
    },
  })

  if (httpImport !== null) {
    // Insert the group shim right after the http import.
    scriptAst.body = scriptAst.body.flatMap((statement) =>
      statement === httpImport ? [httpImport, ...groupAst.body] : statement
    )
  }

  const exports = getExports(scriptAst)

  const hasHandleSummary = exports.some(
    (e) => e.type === 'named' && e.name === 'handleSummary'
  )

  if (!hasHandleSummary) {
    scriptAst.body.push(...checksAst.body)
  }

  // Find any existing options export and replace it with our own.
  const optionsExport = exports.find(
    (e) => e.type === 'named' && e.name === 'options'
  )

  if (optionsExport) {
    traverse(scriptAst, {
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

  const browserOptions =
    browserImport !== null
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

  scriptAst.body.push(
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

  return generate(scriptAst)
}

const getSnippetPath = (snippetName: string) => {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    return path.join(app.getAppPath(), 'resources', snippetName)
  }

  return path.join(process.resourcesPath, snippetName)
}

const getShimPath = (name: string) => {
  // @ts-expect-error We are targeting CommonJS so import.meta is not available
  if (!import.meta.env.PROD) {
    return path.join(app.getAppPath(), 'resources', 'shims', name)
  }

  return path.join(process.resourcesPath, 'shims', name)
}

export const instrumentScriptFromPath = async (scriptPath: string) => {
  const [groupSnippet, checksSnippet, scriptContent] = await Promise.all([
    readFile(getSnippetPath('group_snippet.js'), { encoding: 'utf-8' }),
    readFile(getSnippetPath('checks_snippet.js'), { encoding: 'utf-8' }),
    readFile(scriptPath, { encoding: 'utf-8' }),
  ])

  return instrumentScript({
    script: scriptContent,
    shims: {
      group: groupSnippet,
      checks: checksSnippet,
    },
  })
}
