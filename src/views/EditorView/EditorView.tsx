import { Text } from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'
import * as pathe from 'pathe'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { View } from '@/components/Layout/View'
import { StudioFile } from '@/types'

import { RecordingPreviewer } from '../RecordingPreviewer'

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
    queryFn: () => window.studio.file.open(path),
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
