import { useTheme } from '@/hooks/useTheme'
import { Editor, EditorProps, loader, Monaco } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { EditorToolbar, ToolbarState } from './EditorToolbar'
import { useMemo, useState } from 'react'
import { Flex } from '@radix-ui/themes'
import { useHighlightSearch } from './ReactMonacoEditor.hooks'

loader.config({ monaco })

const defaultOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
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
  searchString?: string
  searchIndex?: number
}

export function ReactMonacoEditor({
  showToolbar,
  searchString,
  searchIndex,
  ...props
}: ReactMonacoEditorProps) {
  const theme = useTheme()
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>()
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    wordWrap: 'off',
  })
  useHighlightSearch({ editor, searchString, searchIndex })

  // Monaco automatically applies word wrap if the content length of a line is >= 10000 characters
  // In this case, we disable the word wrap button so Monaco's internal state is respected
  const shouldEnableWordWrapButton = useMemo(() => {
    const lineCount = editor?.getModel()?.getLineCount()
    if (!lineCount) return false

    for (let i = 1; i <= lineCount; i++) {
      const lineContent = editor?.getModel()?.getLineContent(i)
      if (lineContent && lineContent.length >= 10000) {
        return false
      }
    }

    return true
  }, [editor])

  const handleEditorMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    setEditor(editor)

    if (props.onMount) {
      props.onMount(editor, monaco)
    }
  }

  return (
    <Flex height="100%" width="100%" direction="column">
      {showToolbar && (
        <EditorToolbar
          getState={(state) => setToolbarState(state)}
          actions={{ wordWrap: shouldEnableWordWrapButton }}
        />
      )}
      <Editor
        {...props}
        options={{
          ...defaultOptions,
          ...props.options,
          wordWrap: toolbarState.wordWrap,
        }}
        onMount={handleEditorMount}
        theme={theme === 'dark' ? 'vs-dark' : 'k6-studio-light'}
      />
    </Flex>
  )
}
