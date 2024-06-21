import { GroupedProxyData } from '@/types'
import { TestRule } from '@/types/rules'

export function exportScript(
  recording: GroupedProxyData,
  rules: TestRule[],
  allowlist: string[]
) {
  window.studio.script.generateScript(recording, rules, allowlist)
}
