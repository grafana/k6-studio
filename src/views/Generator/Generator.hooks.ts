import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { useToast } from '@/store/ui/useToast'
import {
  loadGeneratorFile,
  loadHarFile,
  writeGeneratorToFile,
  isGeneratorDirty,
} from './Generator.utils'
import { selectGeneratorData, useGeneratorStore } from '@/store/generator'
import { GeneratorFileData } from '@/types/generator'
import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '@/utils/query'
import log from 'electron-log/renderer'

export function useGeneratorParams() {
  const { fileName } = useParams()
  invariant(fileName, 'fileName is required')

  return {
    fileName,
  }
}

export function useLoadHarFile(fileName?: string) {
  return useQuery({
    queryKey: ['har', fileName],
    enabled: !!fileName,
    queryFn: () => loadHarFile(fileName!),
  })
}

export function useLoadGeneratorFile(fileName: string, migrate?: boolean) {
  return useQuery({
    queryKey: ['generator', fileName, migrate],
    queryFn: () => loadGeneratorFile(fileName, migrate),
  })
}

export function useUpdateValueInGeneratorFile(fileName: string) {
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
      const generator = await loadGeneratorFile(fileName)
      await writeGeneratorToFile(fileName, { ...generator, [key]: value })
    },
  })
}

export function useSaveGeneratorFile(fileName: string) {
  const showToast = useToast()

  return useMutation({
    mutationFn: async (generator: GeneratorFileData) => {
      await writeGeneratorToFile(fileName, generator)
      await queryClient.invalidateQueries({ queryKey: ['generator', fileName] })
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
      log.error(error)
    },
  })
}

export function useIsGeneratorDirty(fileName: string) {
  const generatorState = useGeneratorStore(selectGeneratorData)
  const { data } = useLoadGeneratorFile(fileName)

  // Comparing data without `scriptName`, which is saved to disk in the background
  // and should not be considered as a change
  const { scriptName: _, ...generatorStateData } = generatorState
  const { scriptName: __, ...generatorFileData } = data || {}

  return isGeneratorDirty(generatorStateData, generatorFileData)
}
