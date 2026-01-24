import { useMutation, useQuery } from '@tanstack/react-query'
import log from 'electron-log/renderer'
import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { selectGeneratorData, useGeneratorStore } from '@/store/generator'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'
import { GeneratorFileData } from '@/types/generator'
import { getStudioFileFromPath } from '@/utils/file'
import { queryClient } from '@/utils/query'

import { exportScript, loadGeneratorFile, loadHarFile } from './Generator.utils'

export function useGeneratorParams() {
  const { fileName } = useParams()
  invariant(fileName, 'fileName is required')

  return getStudioFileFromPath('generator', fileName)
}

export function useLoadHarFile(fileName?: string) {
  return useQuery({
    queryKey: ['har', fileName],
    enabled: !!fileName,
    queryFn: () => loadHarFile(fileName!),
  })
}

export function useLoadGeneratorFile(file: StudioFile) {
  return useQuery({
    queryKey: ['generator', file.filePath],
    queryFn: () => loadGeneratorFile(file.filePath),
  })
}

export function useUpdateValueInGeneratorFile(file: StudioFile) {
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
      const generator = await loadGeneratorFile(file.filePath)

      await window.studio.files.save({
        location: {
          type: 'file-on-disk',
          name: file.fileName,
          path: file.filePath,
        },
        content: {
          type: 'http-test',
          test: { ...generator, [key]: value },
        },
      })
    },
  })
}

export function useSaveGeneratorFile(file: StudioFile) {
  const showToast = useToast()

  return useMutation({
    mutationFn: async (generator: GeneratorFileData) => {
      await window.studio.files.save({
        location: {
          type: 'file-on-disk',
          name: file.fileName,
          path: file.filePath,
        },
        content: { type: 'http-test', test: generator },
      })

      await queryClient.invalidateQueries({
        queryKey: ['generator', file.filePath],
      })
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

export function useIsGeneratorDirty(file: StudioFile) {
  const generatorState = useGeneratorStore(selectGeneratorData)
  const { data } = useLoadGeneratorFile(file)

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

export function useScriptExport(file: StudioFile) {
  const showToast = useToast()
  const setScriptName = useGeneratorStore((store) => store.setScriptName)
  const { mutateAsync: updateGeneratorFile } =
    useUpdateValueInGeneratorFile(file)

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
