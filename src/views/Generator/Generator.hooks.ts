import { useNavigate, useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { useToast } from '@/store/ui/useToast'
import { selectGeneratorData, useGeneratorStore } from '@/store/generator'
import { GeneratorFileData } from '@/types/generator'
import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '@/utils/query'
import log from 'electron-log/renderer'
import { getRoutePath } from '@/routeMap'
import { harToProxyData } from '@/utils/harToProxyData'

export function useGeneratorParams() {
  const { fileName } = useParams()
  invariant(fileName, 'fileName is required')

  return {
    fileName,
  }
}

export function useRecordingFile(fileName?: string) {
  const showToast = useToast()
  const setRecording = useGeneratorStore((store) => store.setRecording)

  return useQuery({
    queryKey: ['har', fileName],
    enabled: !!fileName,
    placeholderData: [],
    queryFn: async () => {
      try {
        if (!fileName) return []
        const har = await window.studio.har.openFile(fileName)
        const recording = harToProxyData(har)
        setRecording(recording)
        return recording
      } catch (error) {
        showToast({
          title: 'Failed to load recording',
          status: 'error',
          description: 'Select another recording in the sidebar',
        })
        log.error(error)
        throw error
      }
    },
  })
}

export function useGeneratorFile(fileName: string) {
  const showToast = useToast()
  const navigate = useNavigate()
  const setGenerator = useGeneratorStore((store) => store.setGenerator)

  return useQuery({
    queryKey: ['generator', fileName],
    queryFn: async () => {
      try {
        const generator = await window.studio.generator.loadGenerator(fileName)
        setGenerator(generator)
        return generator
      } catch (error) {
        showToast({
          title: 'Failed to load generator',
          status: 'error',
        })
        log.error(error)
        navigate(getRoutePath('home'), { replace: true })
      }
    },
  })
}

export function useUpdateValueInGeneratorFile(fileName: string) {
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
      const generator = await window.studio.generator.loadGenerator(fileName)
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
  const { data } = useGeneratorFile(fileName)

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
