import { toTypeScriptAst } from './code'
import { format } from './formatting/formatter'
import { toIntermediateAst } from './intermediate'
import { Test } from './types'

export function emitScript(test: Test): Promise<string> {
  const intermediate = toIntermediateAst(test)
  const ast = toTypeScriptAst(intermediate)

  return format(ast)
}
