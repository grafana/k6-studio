import * as monaco from 'monaco-editor'
import { useEffect, useMemo } from 'react'

// https://github.com/microsoft/vscode/blob/9cd58e41a4368fecc7dbd7479da66995919fa923/src/vs/editor/contrib/find/browser/findController.ts#L70
export const enum FindStartFocusAction {
  NoFocusChange,
  FocusFindInput,
  FocusReplaceInput,
}

export interface IFindStartOptions {
  forceRevealReplace: boolean
  seedSearchStringFromSelection: 'none' | 'single' | 'multiple'
  seedSearchStringFromNonEmptySelection: boolean
  seedSearchStringFromGlobalClipboard: boolean
  shouldAnimate: boolean
  shouldFocus: FindStartFocusAction
  updateSearchScope: boolean
  loop: boolean
}

interface IFindController extends monaco.editor.IEditorContribution {
  start: (args: IFindStartOptions) => void
  setSearchString: (searchString: string) => void
  moveToNextMatch: () => void
  moveToPreviousMatch: () => void
  goToMatch: (index: number) => void
  closeFindWidget: () => void
}

export function useHighlightSearch({
  editor,
  searchString,
  searchIndex,
}: {
  editor?: monaco.editor.IStandaloneCodeEditor
  searchString?: string
  searchIndex?: number
}) {
  const findController = useMemo(() => {
    // Get the find widget controller
    return editor?.getContribution<IFindController>(
      'editor.contrib.findController'
    )
  }, [editor])

  useEffect(() => {
    if (!findController) {
      return
    }

    // Close the find widget if there is no search string
    if (!searchString || searchString.trim().length === 0) {
      findController.closeFindWidget()
      return
    }

    // Start the find action
    findController.start({
      forceRevealReplace: false,
      seedSearchStringFromSelection: 'none',
      seedSearchStringFromNonEmptySelection: false,
      seedSearchStringFromGlobalClipboard: false,
      shouldFocus: FindStartFocusAction.FocusFindInput,
      shouldAnimate: false,
      updateSearchScope: false,
      loop: true,
    })

    findController.setSearchString(searchString)
    findController.goToMatch(searchIndex ?? 0)
  }, [findController, searchString, searchIndex])
}
