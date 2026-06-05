import { Editor, EditorProps, loader, Monaco } from '@monaco-editor/react'
import { Flex } from '@radix-ui/themes'
import * as monaco from 'monaco-editor'
import { useEffect, useState } from 'react'

import { useTheme } from '@/hooks/useTheme'

import { DEFAULT_OPTIONS } from './defaultOptions'
import { EditorToolbar, ToolbarState } from './EditorToolbar'
import { useHighlightSearch } from './ReactMonacoEditor.hooks'
import { registerTypeDefinitions } from './registerTypeDefinitions'
import { useShouldEnableWordWrap } from './useShouldEnableWordWrap'

loader.config({ monaco })

interface ReactMonacoEditorProps extends EditorProps {
  showToolbar?: boolean
  searchString?: string
  searchIndex?: number
  onCopy?: (event: ClipboardEvent) => void
  enableK6Types?: boolean
}

export function ReactMonacoEditor({
  showToolbar,
  searchString,
  searchIndex,
  onCopy,
  ...props
}: ReactMonacoEditorProps) {
  const theme = useTheme()
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>()
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    wordWrap: 'off',
  })
  useHighlightSearch({ editor, searchString, searchIndex })

  const enabledWordWrap = useShouldEnableWordWrap(editor)

  const handleEditorMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    setEditor(editor)

    if (props.onMount) {
      props.onMount(editor, monaco)
    }
  }

  const handleBeforeMount = (monaco: Monaco) => {
    registerTypeDefinitions()

    props.beforeMount?.(monaco)
  }

  useEffect(() => {
    if (!editor || !onCopy) {
      return
    }
    // Listen to the native copy event on the editor's DOM element
    const editorDomNode = editor.getDomNode()
    if (editorDomNode) {
      editorDomNode.addEventListener('copy', onCopy)

      return () => {
        editorDomNode.removeEventListener('copy', onCopy)
      }
    }
  }, [editor, onCopy])

  return (
    <Flex height="100%" width="100%" direction="column">
      {showToolbar && (
        <EditorToolbar
          getState={(state) => setToolbarState(state)}
          actions={{ wordWrap: enabledWordWrap }}
        />
      )}
      <Editor
        {...props}
        beforeMount={handleBeforeMount}
        options={{
          ...DEFAULT_OPTIONS,
          ...props.options,
          wordWrap: toolbarState.wordWrap,
        }}
        onMount={handleEditorMount}
        theme={theme === 'dark' ? 'k6-studio-dark' : 'k6-studio-light'}
      />
    </Flex>
  )
}
