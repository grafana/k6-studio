import { useEffect, useState } from 'react'
import type { editor } from 'monaco-editor'
import { Editor, useMonaco } from '@monaco-editor/react'

import { exportScript } from '../Generator.utils'
import { useGeneratorStore } from '@/hooks/useGeneratorStore'

const options: editor.IStandaloneEditorConstructionOptions = {
  wordWrap: 'off',
  tabSize: 2,
  codeLens: false,
  contextmenu: false,
  minimap: {
    enabled: false,
    renderCharacters: false,
  },

  readOnly: true,
  lineNumbersMinChars: 4,
  overviewRulerBorder: false,
  automaticLayout: true,
  fixedOverflowWidgets: true,
  scrollBeyondLastLine: false,

  scrollbar: {
    alwaysConsumeMouseWheel: true,
  },
}

export function ScriptPreview() {
  const { filteredRequests, rules } = useGeneratorStore()
  const monaco = useMonaco()

  useEffect(() => {
    async function updatePreview() {
      const script = await exportScript(filteredRequests, rules)

      monaco?.editor?.getModels()?.[0]?.setValue(script)
    }

    updatePreview()
  }, [monaco?.editor, filteredRequests, rules])

  return (
    <div>
      <Editor height="90vh" defaultLanguage="javascript" options={options} />
    </div>
  )
}
