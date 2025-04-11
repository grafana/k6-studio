import { OnChange } from '@monaco-editor/react'

import { ReactMonacoEditor } from './ReactMonacoEditor'

interface CodeEditorProps {
  value: string
  readOnly?: boolean
  onChange?: OnChange
}

export function CodeEditor({
  value,
  onChange,
  readOnly = false,
}: CodeEditorProps) {
  return (
    <ReactMonacoEditor
      showToolbar
      defaultLanguage="javascript"
      options={{ readOnly }}
      value={value}
      onChange={onChange}
    />
  )
}
