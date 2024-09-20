import { useTheme } from '@/hooks/useTheme'
import { Editor, EditorProps, loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'

loader.config({ monaco })

const defaultOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
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

export function ReactMonacoEditor(props: EditorProps) {
  const theme = useTheme()

  return (
    <Editor
      {...props}
      options={{ ...defaultOptions, ...props.options }}
      theme={theme === 'dark' ? 'vs-dark' : 'k6-studio-light'}
    />
  )
}
