import { useMutation, useQuery } from '@tanstack/react-query'
import log from 'electron-log/renderer'
import { debounce } from 'lodash-es'
import * as pathe from 'pathe'
import { useCallback, useEffect, useState } from 'react'

import {
  GeneratorStore,
  selectFilteredRequests,
  selectGeneratorData,
  useGeneratorStore,
} from '@/store/generator'
import { useToast } from '@/store/ui/useToast'
import { GeneratorFileData } from '@/types/generator'
import { queryClient } from '@/utils/query'

import {
  exportScript,
  generateScriptPreview,
  loadGeneratorFile,
  loadRecording,
} from './Generator.utils'

export function useLoadRecording(filePath?: string) {
  return useQuery({
    queryKey: ['har', filePath],
    enabled: !!filePath,
    queryFn: () => loadRecording(filePath!),
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

  return useCallback(async () => {
    const parsedPath = pathe.parse(generatorFilePath)

    let filePath: string | null = pathe.join(
      parsedPath.dir,
      parsedPath.name + '.js'
    )

    try {
      filePath = await window.studio.script.showSaveDialog(filePath)

      if (filePath === null) {
        return
      }

      await exportScript(filePath)

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

      return
    }

    const scriptName = pathe.basename(filePath)

    setScriptName(scriptName)

    try {
      await updateGeneratorFile({ key: 'scriptName', value: scriptName })
    } catch (error) {
      log.error(error)

      showToast({
        title: 'Failed to update script name',
        status: 'error',
      })
    }
  }, [generatorFilePath, showToast, setScriptName, updateGeneratorFile])
}

export function useScriptPreview(generatorFilePath: string) {
  const [preview, setPreview] = useState('')
  const [error, setError] = useState<Error>()

  // Connect to the store on mount, disconnect on unmount, regenerate preview on state change
  useEffect(() => {
    const updatePreview = debounce(async (state: GeneratorStore) => {
      try {
        setError(undefined)
        const generator = selectGeneratorData(state)
        const requests = selectFilteredRequests(state)

        const scriptPath = pathe.join(
          pathe.dirname(generatorFilePath),
          generator.scriptName || 'script.js'
        )

        const script = await generateScriptPreview(
          scriptPath,
          generator,
          requests
        )
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
  }, [generatorFilePath])

  return { preview, error }
}
