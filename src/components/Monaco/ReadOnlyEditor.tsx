import { Editor } from '@monaco-editor/react'
import { editor } from 'monaco-editor'
import { ComponentProps } from 'react'

import { ReactMonacoEditor } from './ReactMonacoEditor'

const options: editor.IStandaloneEditorConstructionOptions = {
  foldingMaximumRegions: 5,
  lineNumbers: 'off',
  readOnly: true,
  domReadOnly: true,
}

interface Props extends ComponentProps<typeof Editor> {
  searchString?: string
  searchIndex?: number
  showToolbar?: boolean
  onCopy?: (event: ClipboardEvent) => void
}

export function ReadOnlyEditor({ showToolbar = true, ...props }: Props) {
  return (
    <ReactMonacoEditor
      height="100%"
      options={options}
      {...props}
      showToolbar={showToolbar}
    />
  )
}
