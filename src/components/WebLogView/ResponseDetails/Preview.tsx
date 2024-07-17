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

interface PreviewProps {
  content: string
  contentType: string
  format: string
}

export function Preview({ content, contentType, format }: PreviewProps) {
  const theme = useTheme()

  if (format === 'image') {
    return (
      <img
        src={`data:${contentType};base64,${content}`}
        style={{
          display: 'block',
          maxWidth: '100%',
          boxShadow: 'var(--shadow-3)',
        }}
      />
    )
  }

  return (
    <Editor
      theme={theme === 'dark' ? 'vs-dark' : 'vs'}
      height="100%"
      language={format}
      options={options}
      value={content}
    />
  )
}
