import { Flex } from '@radix-ui/themes'
import { Editor } from '@monaco-editor/react'
import { editor } from 'monaco-editor'

import { ProxyData } from '@/types'
import { useTheme } from '@/hooks/useTheme'
import { parseParams } from './utils'

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

export function Payload({ data }: { data: ProxyData }) {
  const theme = useTheme()

  const content = parseParams(data)

  if (!content) {
    return (
      <Flex height="200px" justify="center" align="center">
        Payload not available
      </Flex>
    )
  }

  return (
    <Editor
      theme={theme === 'dark' ? 'vs-dark' : 'vs'}
      height="100%"
      language="javascript"
      options={options}
      value={content}
    />
  )
}
