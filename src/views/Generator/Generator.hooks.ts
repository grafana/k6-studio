import { useMutation, useQuery } from '@tanstack/react-query'
import log from 'electron-log/renderer'

import { useExportScript } from '@/hooks/useExportScript'
import { selectGeneratorData, useGeneratorStore } from '@/store/generator'
import { useToast } from '@/store/ui/useToast'
import * as path from '@/utils/path'

import {
  generateScriptFromGenerator,
  loadGeneratorFile,
  loadHarFile,
} from './Generator.utils'

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
      const { data: generator } = await loadGeneratorFile(filePath)

      await window.studio.generator.saveGenerator(
        { ...generator, [key]: value },
        filePath
      )
    },
  })
}

export function useIsGeneratorDirty(filePath: string) {
  const generatorState = useGeneratorStore(selectGeneratorData)
  const { data } = useLoadGeneratorFile(filePath)

  // Comparing data without `scriptName`, which is saved to disk in the background
  // and should not be considered as a change
  const { scriptName: _, ...generatorStateData } = generatorState
  const { scriptName: __, ...generatorFileData } = data?.data || {}

  // Convert to JSON instead of doing deep equal to remove
  // `property: undefined` values
  return (
    JSON.stringify(generatorStateData) !== JSON.stringify(generatorFileData)
  )
}

export function useScriptExport(generatorFilePath: string) {
  const showToast = useToast()

  const scriptName = useGeneratorStore((store) => store.scriptName)
  const setScriptName = useGeneratorStore((store) => store.setScriptName)

  const { mutateAsync: updateGeneratorFile } =
    useUpdateValueInGeneratorFile(generatorFilePath)

  return useExportScript({
    fileName: scriptName,
    content: (filePath) => {
      return generateScriptFromGenerator(filePath)
    },
    async onSuccess(location) {
      const savedScriptName = path.basename(location.path)

      setScriptName(savedScriptName)

      try {
        await updateGeneratorFile({ key: 'scriptName', value: savedScriptName })
      } catch (error) {
        log.error(error)

        showToast({
          title: 'Failed to update script name',
          status: 'error',
        })
      }
    },
  })
}
