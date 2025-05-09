import * as monaco from 'monaco-editor'
import { useMemo } from 'react'

export function useShouldEnableWordWrap(
  editor:
    | monaco.editor.IStandaloneCodeEditor
    | monaco.editor.IStandaloneDiffEditor
    | undefined
) {
  const model = useMemo(() => {
    return editor?.getModel()
  }, [editor])

  const lineCount = useMemo(() => {
    if (!model) {
      return
    }

    if ('getLineCount' in model) {
      return model.getLineCount()
    }

    return Math.max(
      model.modified.getLineCount(),
      model.original.getLineCount()
    )
  }, [model])

  // Monaco automatically applies word wrap if the content length of a line is >= 10000 characters
  // In this case, we disable the word wrap button so Monaco's internal state is respected
  return useMemo(() => {
    if (!lineCount) return false

    function getLineContent(index: number) {
      if (!model) {
        return
      }

      if ('getLineContent' in model) {
        return model.getLineContent(index)
      }

      return model.modified.getLineContent(index)
    }

    for (let i = 1; i <= lineCount; i++) {
      const lineContent = getLineContent(i)
      if (lineContent && lineContent.length >= 10000) {
        return false
      }
    }

    return true
  }, [lineCount, model])
}
