import * as pathe from 'pathe'
import { useNavigate } from 'react-router-dom'

import { FileContent } from '@/handlers/file/types'
import { getRoutePath } from '@/routeMap'
import { BrowserTestFile } from '@/schemas/browserTest/v1'
import { StudioFile } from '@/types'

import { BrowserTestEditor } from './BrowserTestEditor'

const emptyBrowserTest: BrowserTestFile & { new: true } = {
  new: true,
  version: '1.0' as const,
  actions: [],
}

export function NewBrowserTestView() {
  const navigate = useNavigate()

  const file: StudioFile = {
    type: 'browser-test',
    path: pathe.join('untitled://', 'Untitled.k6b'),
    fileName: 'Untitled.k6b',
    displayName: 'Untitled',
  }

  const handleSave = async (content: FileContent) => {
    const result = await window.studio.file.save({
      content,
      location: { type: 'new', hint: file.fileName },
    })

    if (result === null) {
      return
    }

    navigate(
      getRoutePath('editorView', { path: encodeURIComponent(result.path) }),
      { replace: true }
    )
  }

  return (
    <BrowserTestEditor
      file={file}
      data={emptyBrowserTest}
      onSave={handleSave}
    />
  )
}
