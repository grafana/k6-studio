import { format } from 'prettier/standalone'
import * as prettierPluginBabel from 'prettier/plugins/babel'
// eslint-disable-next-line import/namespace
import * as prettierPluginEStree from 'prettier/plugins/estree'

export function prettify(code: string) {
  return format(code, {
    parser: 'babel',
    plugins: [prettierPluginBabel, prettierPluginEStree],
  })
}
