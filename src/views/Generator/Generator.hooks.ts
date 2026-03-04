import { useMutation, useQuery } from '@tanstack/react-query'
import log from 'electron-log/renderer'
import { useCallback } from 'react'

import { selectGeneratorData, useGeneratorStore } from '@/store/generator'
import { useToast } from '@/store/ui/useToast'
import { GeneratorFileData } from '@/types/generator'
import { queryClient } from '@/utils/query'

import { exportScript, loadGeneratorFile, loadHarFile } from './Generator.utils'

export function useLoadHarFile(fileName?: string) {
  return useQuery({
    queryKey: ['har', fileName],
    enabled: !!fileName,
    queryFn: () => loadHarFile(fileName!),
  })
}

export function useLoadGeneratorFile(filePath: string) {
  return useQuery({
    queryKey: ['generator', filePath],
    queryFn: () => loadGeneratorFile(filePath),
  })
}

export function useUpdateValueInGeneratorFile(filePath: string) {
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
      const generator = await loadGeneratorFile(filePath)
      const updated = { ...generator, [key]: value }
      await window.studio.generator.saveGenerator(updated, filePath)
    },
  })
}

export function useSaveGeneratorFile(filePath: string) {
  const showToast = useToast()

  return useMutation({
    mutationFn: async (generator: GeneratorFileData) => {
      await window.studio.generator.saveGenerator(generator, filePath)
      await queryClient.invalidateQueries({ queryKey: ['generator', filePath] })
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

export function useIsGeneratorDirty(filePath: string) {
  const generatorState = useGeneratorStore(selectGeneratorData)
  const { data } = useLoadGeneratorFile(filePath)

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

export function useScriptExport(generatorFilePath: string) {
  const showToast = useToast()
  const setScriptName = useGeneratorStore((store) => store.setScriptName)
  const { mutateAsync: updateGeneratorFile } =
    useUpdateValueInGeneratorFile(generatorFilePath)

  return useCallback(
    async (scriptName: string) => {
      setScriptName(scriptName)

      try {
        await exportScript(scriptName)
        showToast({
          title: 'Script exported successfully',
          status: 'success',
        })
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
