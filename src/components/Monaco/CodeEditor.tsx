import { OnChange } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { useEffect, useState } from 'react'

import { ReactMonacoEditor } from './ReactMonacoEditor'

interface CodeEditorProps {
  value: string
  options?: monaco.editor.IStandaloneEditorConstructionOptions
  onChange?: OnChange
}

export function CodeEditor({ value, onChange, options }: CodeEditorProps) {
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>()

  useEffect(() => {
    if (!editor) return
    const position = editor.getPosition()
    editor.setValue(value)
    if (position) {
      editor.setPosition(position)
    }
  }, [editor, value])

  const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    setEditor(editor)
  }

  return (
    <ReactMonacoEditor
      defaultLanguage="javascript"
      options={options}
      defaultValue={value}
      onChange={onChange}
      onMount={handleEditorMount}
    />
  )
}
