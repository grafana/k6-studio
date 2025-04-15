import { useMutation, useQuery } from '@tanstack/react-query'
import log from 'electron-log/renderer'
import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { selectGeneratorData, useGeneratorStore } from '@/store/generator'
import { useToast } from '@/store/ui/useToast'
import { GeneratorFileData } from '@/types/generator'
import { queryClient } from '@/utils/query'

import { exportScript, loadGeneratorFile, loadHarFile } from './Generator.utils'

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

export function useLoadGeneratorFile(fileName: string) {
  return useQuery({
    queryKey: ['generator', fileName],
    queryFn: () => loadGeneratorFile(fileName),
  })
}

export function useUpdateValueInGeneratorFile(fileName: string) {
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
      const generator = await loadGeneratorFile(fileName)
      await window.studio.generator.saveGenerator(
        { ...generator, [key]: value },
        fileName
      )
    },
  })
}

export function useSaveGeneratorFile(fileName: string) {
  const showToast = useToast()

  return useMutation({
    mutationFn: async (generator: GeneratorFileData) => {
      await window.studio.generator.saveGenerator(generator, fileName)
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

  // Convert to JSON instead of doing deep equal to remove
  // `property: undefined` values
  return (
    JSON.stringify(generatorStateData) !== JSON.stringify(generatorFileData)
  )
}

export function useScriptExport(generatorFileName: string) {
  const showToast = useToast()
  const setScriptName = useGeneratorStore((store) => store.setScriptName)
  const { mutateAsync: updateGeneratorFile } =
    useUpdateValueInGeneratorFile(generatorFileName)

  return useCallback(
    async (scriptName: string) => {
      setScriptName(scriptName)

      try {
        await exportScript(scriptName)
      } catch (error) {
        log.error(error)

        showToast({
          title: 'Failed to export script',
          status: 'error',
        })
      }

      try {
        await updateGeneratorFile({ key: 'scriptName', value: scriptName })
      } catch (error) {
        log.error(error)

        showToast({
          title: 'Failed to update script name',
          status: 'error',
        })
      }
    },
    [showToast, setScriptName, updateGeneratorFile]
  )
}
