import { ComponentProps } from 'react'
import { Editor } from '@monaco-editor/react'
import { editor } from 'monaco-editor'
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
}

export function ReadOnlyEditor(props: Props) {
  return (
    <ReactMonacoEditor height="100%" options={options} {...props} showToolbar />
  )
}
