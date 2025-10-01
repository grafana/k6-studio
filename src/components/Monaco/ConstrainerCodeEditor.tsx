import { EditorProps } from '@monaco-editor/react'
// eslint-disable-next-line import/no-named-as-default
import constrainedEditor, {
  ConstrainedEditorInstance,
  RestrictionObject,
} from 'constrained-editor-plugin'
import * as monacoTypes from 'monaco-editor'
import { useEffect, useState } from 'react'

import { ReactMonacoEditor } from './ReactMonacoEditor'

interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  editableRange: RestrictionObject['range']
  options: EditorProps['options']
}

export function ConstrainedCodeEditor({
  value,
  onChange,
  editableRange,
  options,
}: CodeEditorProps) {
  const [model, setModel] = useState<monacoTypes.editor.ITextModel | null>()
  const [constrainedInstance, setConstrainedInstance] =
    useState<ConstrainedEditorInstance>()

  useEffect(() => {
    if (!model || !constrainedInstance) {
      return
    }
    // Synchronize the editor model's content before re-applying constraints
    if (value !== model.getValue()) {
      model.setValue(value)
    }

    // Add editable range to editor
    const constrainedModel = constrainedInstance.addRestrictionsTo(model, [
      {
        range: editableRange,
        label: 'editableRange', // Used for reading value onDidChangeContentInEditableRange
        allowMultiline: true,
      },
    ])

    // Listen to changes in the editable range
    constrainedModel.onDidChangeContentInEditableRange(
      (currentlyChangedContent) =>
        onChange?.(currentlyChangedContent.editableRange ?? '')
    )

    // Cleanup
    return constrainedModel.disposeRestrictions
  }, [model, constrainedInstance, editableRange, onChange, value])

  const handleEditorMount = (
    editor: monacoTypes.editor.IStandaloneCodeEditor,
    monaco: typeof monacoTypes
  ) => {
    const instance = constrainedEditor(monaco)
    instance.initializeIn(editor)

    const model = editor.getModel()
    setModel(model)

    setConstrainedInstance(instance)
  }

  return (
    <ReactMonacoEditor
      defaultLanguage="javascript"
      options={options}
      value={value}
      onMount={handleEditorMount}
    />
  )
}
