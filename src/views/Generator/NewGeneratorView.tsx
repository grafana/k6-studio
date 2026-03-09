import * as pathe from 'pathe'
import { useNavigate, useParams } from 'react-router-dom'

import { FileContent } from '@/handlers/file/types'
import { getRoutePath } from '@/routeMap'
import { StudioFile } from '@/types'
import { createNewGeneratorFile } from '@/utils/generator'

import { Generator } from './Generator'

export function NewGeneratorView() {
  const { recordingPath } = useParams<{ recordingPath: string }>()

  const navigate = useNavigate()

  const generator = createNewGeneratorFile(recordingPath, true)

  const file: StudioFile = {
    type: 'generator',
    path: pathe.join('untitled://', 'Untitled.k6g'),
    fileName: 'Untitled.k6g',
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

  return <Generator file={file} data={generator} onSave={handleSave} />
}
