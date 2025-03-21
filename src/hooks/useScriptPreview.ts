import { debounce } from 'lodash-es'
import { useEffect, useState } from 'react'

import {
  selectFilteredRequests,
  selectGeneratorData,
  useGeneratorStore,
  GeneratorStore,
} from '@/store/generator'
import { generateScriptPreview } from '@/views/Generator/Generator.utils'

export function useScriptPreview() {
  const [preview, setPreview] = useState('')
  const [error, setError] = useState<Error>()

  // Connect to the store on mount, disconnect on unmount, regenerate preview on state change
  useEffect(() => {
    const updatePreview = debounce(async (state: GeneratorStore) => {
      try {
        setError(undefined)
        const generator = selectGeneratorData(state)
        const requests = selectFilteredRequests(state)

        const script = await generateScriptPreview(generator, requests)
        setPreview(script)
      } catch (e) {
        console.error(e)
        setError(e as Error)
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

  return { preview, error, hasError: !!error }
}
