import { Box } from '@radix-ui/themes'
import { useMemo } from 'react'

import { ReadOnlyEditor } from './Monaco/ReadOnlyEditor'

export function CodeSnippet({
  value,
  language = 'json',
}: {
  value: string
  language: string
}) {
  const editorHeight = useMemo(() => {
    const lineHeight = 20
    const lines = value.split('\n').length

    return lineHeight * lines
  }, [value])

  // Disable monaco editor focus on mount
  function handleEditorMount() {
    requestAnimationFrame(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
    })
  }

  return (
    <Box height={`${editorHeight}px`}>
      <ReadOnlyEditor
        value={value}
        onMount={handleEditorMount}
        language={language}
        showToolbar={false}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          lineNumbers: 'off',
          folding: false,
          contextmenu: false,
          scrollbar: {
            vertical: 'hidden',
            horizontal: 'hidden',
          },
          renderLineHighlight: 'none',
          overviewRulerLanes: 0,
          // @ts-expect-error incorrect types, renderIndentGuides is a valid option
          renderIndentGuides: false,
          wordWrap: 'on',
          padding: {
            top: 5,
            bottom: 5,
          },
        }}
      />
    </Box>
  )
}
