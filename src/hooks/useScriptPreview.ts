import { useEffect, useState } from 'react'
import { debounce } from 'lodash-es'

import {
  selectFilteredRequests,
  selectGeneratorData,
  useGeneratorStore,
  GeneratorStore,
} from '@/store/generator'
import { groupProxyData } from '@/utils/groups'
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
        const groupedRequests = groupProxyData(requests)

        const script = await generateScriptPreview(generator, groupedRequests)
        setPreview(script)
      } catch (e) {
        console.error(e)
        setError(e as Error)
      }
    }, 100)

    // Initial preview generation
    updatePreview(useGeneratorStore.getState())

    const unsubscribe = useGeneratorStore.subscribe((state) =>
      updatePreview(state)
    )
    return unsubscribe
  }, [])

  return { preview, error, hasError: !!error }
}
