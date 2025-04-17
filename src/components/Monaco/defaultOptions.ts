import * as monaco from 'monaco-editor'

export const DEFAULT_OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions =
  {
    tabSize: 2,
    codeLens: false,
    contextmenu: false,
    minimap: {
      enabled: false,
      renderCharacters: false,
    },
    language: 'javascript',
    lineNumbersMinChars: 4,
    overviewRulerBorder: false,
    automaticLayout: true,
    fixedOverflowWidgets: true,
    scrollBeyondLastLine: false,
    scrollbar: {
      alwaysConsumeMouseWheel: true,
      verticalSliderSize: 4,
      horizontalSliderSize: 4,
      verticalScrollbarSize: 12,
      horizontalScrollbarSize: 12,
    },
  }
