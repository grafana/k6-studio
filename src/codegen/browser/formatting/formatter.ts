/* eslint-disable import/default */
import type { TSESTree as ts } from '@typescript-eslint/types'
import {
  AstPath,
  Plugin,
  Printer,
  SupportOption,
  ParserOptions,
} from 'prettier'
import { builders } from 'prettier/doc'
import defaultOptions, { options, printers } from 'prettier/plugins/estree'
import { format as formatWithPrettier } from 'prettier/standalone'

const { hardline } = builders
const estree = printers.estree

declare module 'prettier/plugins/estree' {
  const printers: {
    estree: Printer<ts.Node>
  }

  const options: Record<string, SupportOption>
}

function applySpacing(node: ts.Node | null, doc: builders.Doc): builders.Doc {
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
          const node = path.getNode()

          const doc =
            node?.comment === undefined
              ? estree.print(path, options, print)
              : ['// ', node.comment]

          return applySpacing(node, doc)
        },
      },
    },
    defaultOptions: defaultOptions as Record<string, unknown>,
    options: options,
  }
}

async function format(ast: ts.Program): Promise<string> {
  return await formatWithPrettier('i,', {
    filepath: 'test.js',
    parser: 'estree',
    plugins: [createPlugin(ast)],
  })
}

export { format }
