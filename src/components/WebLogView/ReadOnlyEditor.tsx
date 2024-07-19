import { ComponentProps } from 'react'
import { Editor } from '@monaco-editor/react'
import { editor } from 'monaco-editor'

import { useTheme } from '@/hooks/useTheme'

const options: editor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  codeLens: false,
  contextmenu: false,
  domReadOnly: true,
  fixedOverflowWidgets: true,
  foldingMaximumRegions: 5,
  lineNumbers: 'off',
  minimap: {
    enabled: false,
    renderCharacters: false,
  },
  overviewRulerBorder: false,
  readOnly: true,
  scrollbar: {
    alwaysConsumeMouseWheel: true,
    horizontalScrollbarSize: 3,
    verticalScrollbarSize: 3,
  },
  scrollBeyondLastLine: false,
  tabSize: 1,
  wordWrap: 'off',
}

export function ReadOnlyEditor(props: ComponentProps<typeof Editor>) {
  const theme = useTheme()

  return (
    <Editor
      theme={theme === 'dark' ? 'vs-dark' : 'vs'}
      height="100%"
      options={options}
      {...props}
    />
  )
}
