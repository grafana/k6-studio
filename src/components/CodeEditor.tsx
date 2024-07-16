import { useTheme } from '@/hooks/useTheme'
import { Editor, OnChange } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { useEffect, useState } from 'react'

const defaultOptions: editor.IStandaloneEditorConstructionOptions = {
  wordWrap: 'off',
  tabSize: 2,
  codeLens: false,
  contextmenu: false,
  minimap: {
    enabled: false,
    renderCharacters: false,
  },
  language: 'javascript',
  lineNumbersMinChars: 4,
  overviewRulerBorder: false,
  automaticLayout: true,
  fixedOverflowWidgets: true,
  scrollBeyondLastLine: false,

  scrollbar: {
    alwaysConsumeMouseWheel: true,
  },
}

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
  const [editor, setEditor] = useState<editor.IStandaloneCodeEditor>()
  const theme = useTheme()

  useEffect(() => {
    if (!editor) return
    const position = editor.getPosition()
    editor.setValue(value)
    if (position) {
      editor.setPosition(position)
    }
  }, [editor, value])

  const handleEditorMount = (editor: editor.IStandaloneCodeEditor) => {
    setEditor(editor)
  }

  return (
    <Editor
      defaultLanguage="javascript"
      options={{ ...defaultOptions, readOnly }}
      defaultValue={value}
      onChange={onChange}
      theme={theme === 'dark' ? 'vs-dark' : 'vs'}
      onMount={handleEditorMount}
    />
  )
}
