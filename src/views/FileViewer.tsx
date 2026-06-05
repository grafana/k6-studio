import { css, keyframes } from '@emotion/react'
import { Flex, Spinner } from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'
import { lazy } from 'react'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { ErrorMessage } from '@/components/ErrorMessage'
import { FileContent } from '@/handlers/fs/types'
import { StudioFile } from '@/types'
import * as path from '@/utils/path'

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const RecordingPreviewer = lazy(() =>
  import('@/views/RecordingPreviewer').then((module) => ({
    default: module.RecordingPreviewer,
  }))
)

const Generator = lazy(() =>
  import('@/views/Generator').then((module) => ({ default: module.Generator }))
)

const BrowserTestEditor = lazy(() =>
  import('@/views/BrowserTestEditor').then((module) => ({
    default: module.BrowserTestEditor,
  }))
)

const Validator = lazy(() =>
  import('@/views/Validator').then((module) => ({ default: module.Validator }))
)

const DataFile = lazy(() =>
  import('@/views/DataFile').then((module) => ({ default: module.DataFile }))
)

function makeStudioFile(
  filePath: string,
  type: StudioFile['type']
): StudioFile {
  const { base, name } = path.parse(filePath)

  return {
    type,
    path: filePath,
    fileName: base,
    displayName: name,
  }
}

function FileSwitch({
  filePath,
  content,
}: {
  filePath: string
  content: FileContent
}) {
  if (content.type === 'unsupported') {
    return (
      <ErrorMessage
        title="Unsupported file type"
        message="The file type is not supported or is in an incorrect format."
      />
    )
  }

  const file = makeStudioFile(filePath, content.type)

  switch (content.type) {
    case 'recording':
      return <RecordingPreviewer file={file} content={content} />

    case 'generator':
      return <Generator file={file} content={content} />

    case 'browser-test':
      return (
        <BrowserTestEditor
          key={filePath}
          file={file}
          initialData={content.data}
        />
      )

    case 'script':
      return <Validator file={file} content={content} />

    case 'data-file':
      return <DataFile file={file} content={content} />

    default:
      return content satisfies never
  }
}

export function FileViewer() {
  const { filePath } = useParams<{ filePath: string }>()

  invariant(filePath, 'filePath param is required')

  const { data: content, isError } = useQuery({
    queryKey: ['file', filePath],
    queryFn() {
      return window.studio.fs.openFile(filePath)
    },
    staleTime: 0,
    gcTime: 0,
  })

  if (isError) {
    return (
      <ErrorMessage
        title="Failed to load file"
        message="An error occurred while loading the file."
      />
    )
  }

  if (content === undefined) {
    return (
      <Flex
        css={css`
          opacity: 0;
          animation: ${fadeIn} 0.1s ease-in 0.3s;
        `}
        align="center"
        justify="center"
        height="100%"
      >
        <Spinner />
      </Flex>
    )
  }

  return (
    <Flex
      key={filePath}
      css={css`
        animation: ${fadeIn} 0.1s ease-in;
      `}
      height="100%"
    >
      <FileSwitch filePath={filePath} content={content} />
    </Flex>
  )
}
