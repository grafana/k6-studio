import { Editor, DiffEditor as MonacoDiffEditor } from '@monaco-editor/react'
import { Flex } from '@radix-ui/themes'
import { editor } from 'monaco-editor'
import * as monaco from 'monaco-editor'
import { ComponentProps, useState } from 'react'

import { useTheme } from '@/hooks/useTheme'

import { EditorToolbar, ToolbarState } from './EditorToolbar'
import { DEFAULT_OPTIONS } from './defaultOptions'
import { useShouldEnableWordWrap } from './useShouldEnableWordWrap'

const DEFAULT_DIFF_OPTIONS: editor.IDiffEditorOptions = {
  ...DEFAULT_OPTIONS,
  readOnly: true,
  renderOverviewRuler: false,
  lineNumbers: 'off',
  renderIndicators: false,
  useShadowDOM: false, // needed to disable context menu by CSS
}

interface Props extends ComponentProps<typeof Editor> {
  original?: string
  showToolbar?: boolean
}

export function DiffEditor({
  original,
  value,
  language,
  options,
  showToolbar,
}: Props) {
  const theme = useTheme()

  const [editor, setEditor] = useState<monaco.editor.IStandaloneDiffEditor>()
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    wordWrap: 'off',
  })

  const enabledWordWrap = useShouldEnableWordWrap(editor)

  return (
    <Flex height="100%" width="100%" direction="column">
      {showToolbar && (
        <EditorToolbar
          getState={(state) => setToolbarState(state)}
          actions={{ wordWrap: enabledWordWrap }}
        />
      )}
      <MonacoDiffEditor
        options={{
          ...DEFAULT_DIFF_OPTIONS,
          ...options,
          wordWrap: toolbarState.wordWrap,
        }}
        onMount={setEditor}
        language={language}
        original={original}
        modified={value}
        theme={theme === 'dark' ? 'k6-studio-dark' : 'k6-studio-light'}
        css={{
          // Hide lightbulb icon in diff editor
          // https://github.com/microsoft/monaco-editor/issues/3873
          '.codicon': {
            display: 'none',
          },
          // Hide context menu when clicking on removed line
          '.monaco-menu': {
            display: 'none !important',
          },
        }}
      />
    </Flex>
  )
}
