import { OnChange } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { useEffect, useState } from 'react'
import constrainedEditor from 'constrained-editor-plugin'

import { ReactMonacoEditor } from './ReactMonacoEditor'

interface CodeEditorProps {
  value: string
  readOnly?: boolean
  onChange?: OnChange
}

const wrapper = `
function getParameterizationValue0() {
  // make sure you return something
}
`

export function ConstrainedCodeEditor({
  value,
  onChange,
  readOnly = false,
  range,
}: CodeEditorProps) {
  console.log('range', range)
  function handleEditorMount(
    editor: monaco.editor.IStandaloneCodeEditor,
    monac: typeof monaco
  ) {
    const model = editor.getModel()

    const instance = constrainedEditor(monac)
    console.log('instance', instance)
    instance.initializeIn(editor)

    instance.addRestrictionsTo(model, [range])
    model?.onDidChangeContentInEditableRange((currentlyChangedContent) =>
      onChange?.(currentlyChangedContent.range)
    )
  }

  return (
    <ReactMonacoEditor
      defaultLanguage="javascript"
      options={{ readOnly }}
      defaultValue={value}
      // onChange={onChange}
      onMount={handleEditorMount}
    />
  )
}
