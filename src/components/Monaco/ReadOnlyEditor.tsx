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
      {...props}
      options={{ ...props.options, ...options }}
      showToolbar={showToolbar}
    />
  )
}
