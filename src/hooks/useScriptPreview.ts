import { debounce } from 'lodash-es'
import { useEffect, useState } from 'react'

import {
  selectFilteredRequests,
  selectGeneratorData,
  useGeneratorStore,
  GeneratorStore,
} from '@/store/generator'
import { generateScriptPreview } from '@/views/Generator/Generator.utils'

export type ScriptPreview =
  | { valid: true; preview: string }
  | { valid: false; error: Error }

export function useScriptPreview(): ScriptPreview {
  const [state, setState] = useState<ScriptPreview>({
    valid: true,
    preview: '',
  })

  // Connect to the store on mount, disconnect on unmount, regenerate preview on state change
  useEffect(() => {
    const updatePreview = debounce(async (storeState: GeneratorStore) => {
      try {
        const generator = selectGeneratorData(storeState)
        const requests = selectFilteredRequests(storeState)

        const preview = await generateScriptPreview(generator, requests)
        setState({ valid: true, preview })
      } catch (error) {
        console.error(error)

        setState({
          valid: false,
          error: error instanceof Error ? error : new Error(String(error)),
        })
      }
    }, 100)

    // Initial preview generation
    // TODO: https://github.com/grafana/k6-studio/issues/277
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    updatePreview(useGeneratorStore.getState())

    const unsubscribe = useGeneratorStore.subscribe((state) =>
      updatePreview(state)
    )
    return unsubscribe
  }, [])

  return state
}
