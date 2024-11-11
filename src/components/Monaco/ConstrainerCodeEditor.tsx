import * as monacoTypes from 'monaco-editor'
import { ReactMonacoEditor } from './ReactMonacoEditor'
// Locally added types
// eslint-disable-next-line import/no-named-as-default
import constrainedEditor, { RestrictionObject } from 'constrained-editor-plugin'
import { useEffect, useState } from 'react'
import { EditorProps } from '@monaco-editor/react'

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
  const [editor, setEditor] =
    useState<monacoTypes.editor.IStandaloneCodeEditor>()
  const [monaco, setMonaco] = useState<typeof monacoTypes>()

  // Add editable range to editor
  useEffect(() => {
    if (!editor || !monaco) {
      return
    }

    const model = editor.getModel()
    if (!model) {
      return
    }

    const instance = constrainedEditor(monaco)
    instance.initializeIn(editor)

    const constraindModel = instance.addRestrictionsTo(model, [
      {
        range: editableRange,
        label: 'editableRange', // Used for reading value onDidChangeContentInEditableRange
        allowMultiline: true,
      },
    ])

    constraindModel.onDidChangeContentInEditableRange(
      (currentlyChangedContent) =>
        onChange?.(currentlyChangedContent.editableRange ?? '')
    )

    return () => constraindModel.disposeRestrictions()
  }, [editor, monaco, onChange, editableRange])

  // Update value in editor when it changes externally, e.g. switching between rules
  useEffect(() => {
    if (!editor) return
    const position = editor.getPosition()
    editor.setValue(value)
    if (position) {
      editor.setPosition(position)
    }
  }, [editor, value])

  const handleEditorMount = (
    editor: monacoTypes.editor.IStandaloneCodeEditor,
    monaco: typeof monacoTypes
  ) => {
    setEditor(editor)
    setMonaco(monaco)
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
