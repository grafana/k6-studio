/* eslint-disable import/default */
import type {
  AstPath,
  Plugin,
  Printer,
  SupportOption,
  ParserOptions,
} from 'prettier'
import { builders } from 'prettier/doc'
import defaultOptions, { options, printers } from 'prettier/plugins/estree'
import { format as formatWithPrettier } from 'prettier/standalone'
import type { TSESTree as ts } from '@typescript-eslint/types'
import tsParser from 'prettier/plugins/typescript'

const { hardline } = builders
const estree = printers.estree

declare module 'prettier/plugins/estree' {
  const printers: {
    estree: Printer<ts.Node>
  }

  const options: Record<string, SupportOption>
}

/**
 * A custom Prettier plugin that checks our custom `newLine` property and
 * adds new lines before, after, or both before and after the node.
 */
function createPlugin(program: ts.Program): Plugin {
  return {
    languages: [
      {
        name: 'estree',
        parsers: ['estree'],
      },
    ],
    parsers: {
      estree: {
        locStart() {
          return 0
        },
        locEnd() {
          return 0
        },
        parse() {
          return program
        },
        astFormat: 'estree',
      },
    },
    printers: {
      estree: {
        print(path: AstPath<ts.Node>, options: ParserOptions<ts.Node>, print) {
          const doc = estree.print(path, options, print)
          const node = path.getNode()

          if (node?.newLine === 'before') {
            return [hardline, doc]
          }

          if (node?.newLine === 'after') {
            return [doc, hardline]
          }

          if (node?.newLine === 'both') {
            return [hardline, doc, hardline]
          }

          return doc
        },
      },
    },
    defaultOptions: defaultOptions as Record<string, unknown>,
    options: options,
  }
}

async function format(ast: ts.Program | string): Promise<string> {
  if (typeof ast === 'string') {
    return await formatWithPrettier(ast, {
      filepath: 'test.js',
      parser: 'typescript',
      plugins: [defaultOptions, tsParser],
    })
  }

  return await formatWithPrettier('i,', {
    filepath: 'test.js',
    parser: 'estree',
    plugins: [createPlugin(ast)],
  })
}

export { format }
