import * as prettierPluginBabel from 'prettier/plugins/babel'
import * as prettierPluginEStree from 'prettier/plugins/estree'
import { format } from 'prettier/standalone'

export function prettify(code: string) {
  return format(code, {
    parser: 'babel',
    plugins: [prettierPluginBabel, prettierPluginEStree],
  })
}
