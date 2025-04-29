import { Editor, DiffEditor as MonacoDiffEditor } from '@monaco-editor/react'
import { editor } from 'monaco-editor'
import { ComponentProps } from 'react'

import { useTheme } from '@/hooks/useTheme'

import { DEFAULT_OPTIONS } from './defaultOptions'
const DEFAULT_DIFF_OPTIONS: editor.IDiffEditorOptions = {
  ...DEFAULT_OPTIONS,
  readOnly: true,
  renderOverviewRuler: false,
  lineNumbers: 'off',
}

interface Props extends ComponentProps<typeof Editor> {
  original?: string
}

export function DiffEditor({ original, value, language, options }: Props) {
  const theme = useTheme()
  return (
    <MonacoDiffEditor
      options={{
        ...DEFAULT_DIFF_OPTIONS,
        ...options,
      }}
      language={language}
      original={original}
      modified={value}
      theme={theme === 'dark' ? 'k6-studio-dark' : 'k6-studio-light'}
      css={{
        // Hide lightbulb icon in diff editor
        '.codicon': {
          display: 'none',
        },
      }}
    />
  )
}
