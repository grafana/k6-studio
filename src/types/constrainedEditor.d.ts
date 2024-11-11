declare module 'constrained-editor-plugin' {
  import * as monacoTypes from 'monaco-editor'

  type Range = [number, number, number, number] | number[]
  type EditableRangesMap = Record<string, RestrictionObject>
  type ValueMap = Record<string, string>

  type ValueInEditableRanges = Record<string, string>

  type EditableRangeObject = Record<
    string,
    { allowMultiline: boolean; range: Range; originalRange: Range }
  >

  export interface RestrictionObject {
    label: string
    range: Range
    allowMultiline?: boolean
    validate?: (currentValue: string, currentRange: Range) => boolean
  }

  export interface ConstrainedModel extends monacoTypes.editor.ITextModel {
    editInRestrictedArea: boolean
    getCurrentEditableRanges: () => EditableRangesMap
    getValueInEditableRanges: () => ValueMap
    disposeRestrictions: () => void
    onDidChangeContentInEditableRange: (
      callback: (
        currentlyChangedContent: ValueInEditableRanges,
        allValuesInEditableRanges: ValueInEditableRanges,
        currentEditableRangeObject: EditableRangeObject
      ) => void
    ) => void
    updateRestrictions: (ranges: RestrictionObject[]) => void
    updateValueInEditableRanges: (
      object: ValueMap,
      forceMoveMarkers?: boolean
    ) => void
    toggleHighlightOfEditableAreas: () => void
  }

  export interface ConstrainedEditorInstance {
    initializeIn: (
      editor: monacoTypes.editor.IStandaloneCodeEditor
    ) => boolean | never
    addRestrictionsTo: (
      model: monacoTypes.editor.ITextModel,
      ranges: RestrictionObject[]
    ) => ConstrainedModel
    removeRestrictionsIn: () => boolean | never
    disposeConstrainer: () => boolean
    toggleDevMode: () => void
  }

  export declare function constrainedEditor(
    monaco: typeof monacoTypes
  ): ConstrainedEditorInstance
  export default constrainedEditor
}
