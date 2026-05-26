import log from 'electron-log/renderer'
import { lazy, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { FileContent } from '@/handlers/fs/types'
import { getRoutePath } from '@/routeMap'
import { StudioFile } from '@/types'
import * as path from '@/utils/path'

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

export function FileViewer() {
  const { filePath } = useParams<{ filePath: string }>()
  const navigate = useNavigate()
  const [content, setContent] = useState<FileContent | null>(null)

  useEffect(() => {
    if (!filePath) {
      navigate(getRoutePath('home'), { replace: true })
      return
    }

    let cancelled = false

    window.studio.fs
      .openFile(filePath)
      .then((result) => {
        if (cancelled) return

        if (result.type === 'unsupported') {
          navigate(getRoutePath('home'), { replace: true })
          return
        }

        setContent(result)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        log.error(error)
        navigate(getRoutePath('home'), { replace: true })
      })

    return () => {
      cancelled = true
    }
  }, [filePath, navigate])

  if (!filePath || !content) {
    return null
  }

  if (content.type === 'recording') {
    const file = makeStudioFile(filePath, 'recording')
    return (
      <RecordingPreviewer key={filePath} file={file} content={content.data} />
    )
  }

  if (content.type === 'generator') {
    const file = makeStudioFile(filePath, 'generator')
    return <Generator key={filePath} file={file} initialData={content.data} />
  }

  if (content.type === 'browser-test') {
    const file = makeStudioFile(filePath, 'browser-test')
    return (
      <BrowserTestEditor
        key={filePath}
        file={file}
        initialData={content.data}
      />
    )
  }

  if (content.type === 'script') {
    const file = makeStudioFile(filePath, 'script')
    return <Validator key={filePath} file={file} content={content} />
  }

  if (content.type === 'data-file') {
    const file = makeStudioFile(filePath, 'data-file')
    return <DataFile key={filePath} file={file} content={content.data} />
  }

  return null
}
