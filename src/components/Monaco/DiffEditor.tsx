import { Editor, DiffEditor as MonacoDiffEditor } from '@monaco-editor/react'
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
  original: string
}

export function DiffEditor(props: Props) {
  return (
    <MonacoDiffEditor
      options={options}
      original={props.original}
      modified={props.value}
    />
  )
}
