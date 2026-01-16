import * as prettierPluginBabel from 'prettier/plugins/babel'
// eslint-disable-next-line import-x/namespace
import * as prettierPluginEStree from 'prettier/plugins/estree'
import { format } from 'prettier/standalone'

export function prettify(code: string) {
  return format(code, {
    parser: 'babel',
    plugins: [prettierPluginBabel, prettierPluginEStree],
  })
}
