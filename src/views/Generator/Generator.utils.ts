import { ProxyData } from '@/types'
import { TestRule } from '@/types/rules'
import { generateScript } from '@/codegen'
import { format } from 'prettier/standalone'
import * as prettierPluginBabel from 'prettier/plugins/babel'
// eslint-disable-next-line import/namespace
import * as prettierPluginEStree from 'prettier/plugins/estree'
import { groupProxyData } from '@/utils/groups'
import { GeneratorState } from '@/hooks/useGeneratorStore/types'
import { CommonOptions } from './GeneratorDrawer/LoadProfile/types'
import { ExecutorType } from '@/constants/generator'
import { exhaustive } from '@/utils/typescript'

export async function exportScript(recording: ProxyData[], rules: TestRule[]) {
  const groupedProxyData = groupProxyData(recording)
  const script = generateScript({
    recording: groupedProxyData,
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

export const getLoadProfile = (state: GeneratorState) => {
  const commonOptions: CommonOptions = {
    executor: state.executor,
    startTime: state.startTime,
    gracefulStop: state.gracefulStop,
  }

  switch (state.executor) {
    case ExecutorType.RampingVUs:
      return {
        stages: state.stages,
        gracefulRampDown: state.gracefulRampDown,
        startVUs: state.startVUs,
        ...commonOptions,
        executor: ExecutorType.RampingVUs,
      }
    case ExecutorType.SharedIterations:
      return {
        iterations: state.iterations,
        maxDuration: state.maxDuration,
        vus: state.vus,
        ...commonOptions,
        executor: ExecutorType.SharedIterations,
      }
    default:
      exhaustive(state.executor)
  }
}
