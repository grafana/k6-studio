import { useTheme } from '@/hooks/useTheme'
import { Editor, EditorProps, loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { EditorToolbar, ToolbarState } from './EditorToolbar'
import { useState } from 'react'
import { Flex } from '@radix-ui/themes'

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

interface ReactMonacoEditorProps extends EditorProps {
  showToolbar?: boolean
}

export function ReactMonacoEditor({
  showToolbar,
  ...props
}: ReactMonacoEditorProps) {
  const theme = useTheme()
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    wordWrap: 'off',
  })

  return (
    <Flex height="100%" width="100%" direction="column">
      {showToolbar && (
        <EditorToolbar getState={(state) => setToolbarState(state)} />
      )}
      <Editor
        {...props}
        options={{
          ...defaultOptions,
          ...props.options,
          wordWrap: toolbarState.wordWrap,
        }}
        theme={theme === 'dark' ? 'vs-dark' : 'k6-studio-light'}
      />
    </Flex>
  )
}
