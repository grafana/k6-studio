import { Editor, DiffEditor as MonacoDiffEditor } from '@monaco-editor/react'
import { editor } from 'monaco-editor'
import { ComponentProps } from 'react'

import { useTheme } from '@/hooks/useTheme'

import { DEFAULT_OPTIONS } from './defaultOptions'
const options: editor.IStandaloneEditorConstructionOptions = {
  ...DEFAULT_OPTIONS,
  readOnly: true,
}

interface Props extends ComponentProps<typeof Editor> {
  original?: string
}

export function DiffEditor(props: Props) {
  const theme = useTheme()
  return (
    <MonacoDiffEditor
      options={{
        ...options,
        ...props.options,
      }}
      original={props.original}
      modified={props.value}
      theme={theme === 'dark' ? 'k6-studio-dark' : 'k6-studio-light'}
    />
  )
}
