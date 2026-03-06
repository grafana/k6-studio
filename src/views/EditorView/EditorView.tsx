import { Text } from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'
import * as pathe from 'pathe'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { View } from '@/components/Layout/View'
import { StudioFile } from '@/types'

import { BrowserTestEditor } from '../BrowserTestEditor'
import { DataFile } from '../DataFile'
import { Generator } from '../Generator'
import { RecordingPreviewer } from '../RecordingPreviewer'
import { Validator } from '../Validator'

function createStudioFile(path: string, type: StudioFile['type']): StudioFile {
  const fileName = pathe.basename(path)
  const displayName = pathe.basename(path, pathe.extname(path))
  return {
    type,
    path,
    fileName,
    displayName,
  }
}

export function EditorView() {
  const { path: pathParam } = useParams()

  invariant(pathParam, 'path is required')

  const path = decodeURIComponent(pathParam)

  const {
    data: result,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['file', path],
    queryFn: async () => {
      const result = await window.studio.file.open(path)

      if (result.type === 'script') {
        const options = await window.studio.script.analyzeScript({
          type: 'path',
          path: path,
        })

        return {
          ...result,
          options,
        }
      }

      return result
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })

  if (isLoading) {
    return (
      <View title="" actions={<></>} loading>
        {null}
      </View>
    )
  }

  if (isError) {
    return (
      <View title="File" actions={<></>}>
        <Text color="red">
          Failed to open file:{' '}
          {error instanceof Error ? error.message : String(error)}
        </Text>
      </View>
    )
  }

  invariant(result, 'Expected result')

  if (result.type === 'recording') {
    const file = createStudioFile(path, 'recording')

    return <RecordingPreviewer file={file} data={result.data} />
  }

  if (result.type === 'script') {
    const file = createStudioFile(path, 'script')

    return (
      <Validator
        file={file}
        scriptData={{
          script: result.content,
          options: result.options,
          isExternal: result.isExternal,
        }}
      />
    )
  }

  if (result.type === 'json' || result.type === 'csv') {
    const file = createStudioFile(path, result.type)

    return <DataFile file={file} preview={result} />
  }

  if (result.type === 'browser-test') {
    const file = createStudioFile(path, 'browser-test')

    return <BrowserTestEditor key={path} file={file} data={result.data} />
  }

  if (result.type === 'generator') {
    const file = createStudioFile(path, 'generator')

    return <Generator file={file} data={result.data} />
  }

  if (result.type === 'unsupported-format') {
    return (
      <View title="File" actions={<></>}>
        <Text>This file type is not supported.</Text>
      </View>
    )
  }

  return (
    <View title="File" actions={<></>}>
      <Text>Preview not available for this file type.</Text>
    </View>
  )
}
