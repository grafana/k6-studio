import { useEffect } from 'react'
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
  const { recording, requestFilters, rules } = useGeneratorStore()
  const monaco = useMonaco()

  useEffect(() => {
    async function updatePreview() {
      const requestFilterUrls = requestFilters.map((filter) => filter.url)
      const script = await exportScript(recording, rules, requestFilterUrls)

      monaco?.editor?.getModels()?.[0]?.setValue(script)
    }

    updatePreview()
  }, [monaco?.editor, recording, requestFilters, rules])

  return (
    <div>
      <Editor height="90vh" defaultLanguage="javascript" options={options} />
    </div>
  )
}
