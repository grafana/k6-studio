import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { useToast } from '@/store/ui/useToast'
import {
  loadGeneratorFile,
  loadHarFile,
  writeGeneratorToFile,
} from './Generator.utils'
import { selectGeneratorData, useGeneratorStore } from '@/store/generator'
import { GeneratorFileData } from '@/types/generator'
import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '@/utils/query'
import { isEqual } from 'lodash-es'

export function useGeneratorParams() {
  const { fileName, ruleId } = useParams()
  invariant(fileName, 'fileName is required')

  return {
    fileName,
    ruleId,
  }
}

export function useLoadHarFile(fileName?: string) {
  return useQuery({
    queryKey: ['har', fileName],
    enabled: !!fileName,
    queryFn: () => loadHarFile(fileName!),
  })
}

export function useLoadGeneratorFile(fileName: string) {
  return useQuery({
    queryKey: ['generator', fileName],
    queryFn: () => loadGeneratorFile(fileName),
  })
}

export function useSaveGeneratorFile(fileName: string) {
  const showToast = useToast()

  return useMutation({
    mutationFn: async (generator: GeneratorFileData) => {
      await writeGeneratorToFile(fileName, generator)
      queryClient.invalidateQueries({ queryKey: ['generator', fileName] })
    },

    onSuccess: () => {
      showToast({
        title: 'Generator saved',
        status: 'success',
      })
    },

    onError: (error) => {
      console.error('Failed to save generator', error)

      showToast({
        title: 'Failed to save generator',
        status: 'error',
        description: error.message,
      })
    },
  })
}

export function useIsGeneratorDirty(fileName: string) {
  const generatorState = useGeneratorStore(selectGeneratorData)
  const { data } = useLoadGeneratorFile(fileName)

  return !isEqual(generatorState, data)
}
