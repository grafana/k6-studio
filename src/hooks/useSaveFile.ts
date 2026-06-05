import { useMutation } from '@tanstack/react-query'
import { FileFilter } from 'electron'
import { useCallback, useEffect, useRef, useState } from 'react'

import { FileContent, FileLocation, StorageLocation } from '@/handlers/fs/types'
import { MenuItem, MenuState } from '@/handlers/ui/types'

const handlers: { [P in MenuItem]: Array<(options: SaveFileOptions) => void> } =
  {
    save: [],
    saveAs: [],
    exportScript: [],
  }

window.studio.ui.onRequestSave(({ menuItem, saveAs }) => {
  const lastHandler = handlers[menuItem].at(-1)

  lastHandler?.({ saveAs })
})

function syncMenuState() {
  return window.studio.ui.setMenuState({
    save: handlers.save.length > 0,
    saveAs: handlers.saveAs.length > 0,
    exportScript: handlers.exportScript.length > 0,
  })
}

function resolveLocation(
  location: StorageLocation,
  filters: FileFilter[],
  saveAs: boolean
): Promise<FileLocation | undefined> {
  switch (location.type) {
    case 'untitled':
      return window.studio.fs.showSaveAsDialog(location, filters)

    case 'file':
      if (saveAs) {
        return window.studio.fs.showSaveAsDialog(location, filters)
      }

      return Promise.resolve(location)
  }
}

interface SaveFileOptions {
  saveAs?: boolean
}

interface UseSaveFileOptions {
  menuItems?: Partial<MenuState>
  location: StorageLocation
  content: (location: FileLocation) => Promise<FileContent> | FileContent
  filters: FileFilter[]
  onSave?: (location: FileLocation) => void
  onCancel?: () => void
  onError?: (error: Error) => void
}

export function useSaveFile({
  menuItems = {},
  location,
  content,
  filters,
  onSave,
  onCancel,
  onError,
}: UseSaveFileOptions) {
  const [menuItemState, setMenuItemState] = useState(menuItems)

  if (
    menuItems.save !== menuItemState.save ||
    menuItems.saveAs !== menuItemState.saveAs ||
    menuItems.exportScript !== menuItemState.exportScript
  ) {
    // Weird as it may seem, this is actually the recommended over useEffect.
    // https://react.dev/reference/react/useState#storing-information-from-previous-renders
    setMenuItemState(menuItems)
  }

  const { mutateAsync: saveFile, isPending } = useMutation({
    async mutationFn({ saveAs = false }: SaveFileOptions = {}) {
      const resolvedLocation = await resolveLocation(location, filters, saveAs)

      if (resolvedLocation === undefined) {
        return undefined
      }

      const fileContent = await content(resolvedLocation)

      return window.studio.fs.saveFile(resolvedLocation, fileContent)
    },
    onSuccess(location) {
      if (location === undefined) {
        onCancel?.()

        return
      }

      return onSave?.(location)
    },
    onError,
  })

  const isPendingRef = useRef(isPending)

  useEffect(() => {
    isPendingRef.current = isPending
  })

  useEffect(() => {
    const entries = Object.entries(menuItemState) as [MenuItem, boolean][]

    function handleMenuSave(options: SaveFileOptions) {
      if (isPendingRef.current) {
        return
      }

      void saveFile(options)
    }

    for (const [item, enabled] of entries) {
      if (enabled) {
        handlers[item].push(handleMenuSave)
      }
    }

    // We do a sanity check here because having multiple listeners for the same menu item would create weird
    // situations where the RequestSave event is triggered twice, causing the save dialog to open twice. Hopefully
    // logging a warning here will help us identify and fix the underlying issue if it ever happens.
    for (const [item, fns] of Object.entries(handlers)) {
      if (fns.length > 1) {
        console.warn(
          `Menu item ${item} was already registered. This may indicate a previous instance failed to clean ` +
            `up or that two instances are trying to register the same menu item at the same time. Only the last ` +
            `registered handler will be called.`
        )
      }
    }

    syncMenuState()

    return () => {
      for (const [item] of entries) {
        handlers[item] = handlers[item].filter((fn) => fn !== handleMenuSave)
      }

      syncMenuState()
    }
  }, [menuItemState, saveFile])

  return useCallback(
    (options: SaveFileOptions = {}) => {
      return saveFile(options)
    },
    [saveFile]
  )
}
