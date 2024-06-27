import { GroupedProxyData } from '@/types'
import { TestRule } from '@/types/rules'
import { generateScript } from '@/codegen'
import { applyRequestFilter } from '@/utils/requestFilters'
import { format } from 'prettier/standalone'
import * as prettierPluginBabel from 'prettier/plugins/babel'
// eslint-disable-next-line import/namespace
import * as prettierPluginEStree from 'prettier/plugins/estree'

export async function exportScript(
  recording: GroupedProxyData,
  rules: TestRule[],
  allowlist: string[]
) {
  const filteredProxyData = applyRequestFilter(recording, allowlist)
  const script = generateScript({
    recording: filteredProxyData,
    rules,
  })
  const prettifiedScript = await format(script, {
    parser: 'babel',
    plugins: [prettierPluginBabel, prettierPluginEStree],
  })

  return prettifiedScript
}

export function saveScript(script: string) {
  window.studio.script.saveScript(script)
}
