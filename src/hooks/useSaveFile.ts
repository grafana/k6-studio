import { useMutation } from '@tanstack/react-query'
import { FileFilter } from 'electron'
import { useEffect, useId, useRef, useState } from 'react'

import { FileContent, FileLocation, StorageLocation } from '@/handlers/fs/types'
import { MenuItem } from '@/handlers/ui/types'

function useCrash(): (error: Error) => void {
  const [error, setError] = useState<Error | null>(null)

  if (error) {
    throw error
  }

  return setError
}

const menuItemStates: { [P in MenuItem]: boolean } = {
  save: false,
  'save-as': false,
  'export-script': false,
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
  menuItems?: MenuItem[]
  location: StorageLocation
  content: (location: FileLocation) => Promise<FileContent> | FileContent
  filters: FileFilter[]
  onSave?: (location: FileLocation) => void
  onCancel?: () => void
  onError?: (error: Error) => void
}

export function useSaveFile({
  menuItems = [],
  location,
  content,
  filters,
  onSave,
  onCancel,
  onError,
}: UseSaveFileOptions) {
  const hookId = useId()
  const crash = useCrash()

  // We don't allow changing the menu items after initialization
  const menuItemsRef = useRef(menuItems)

  const { mutateAsync: saveFile } = useMutation({
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

      onSave?.(location)
    },
    onError,
  })

  useEffect(() => {
    const menuItems = menuItemsRef.current

    // Validate all items before setting any state to prevent partial leaks
    for (const menuItem of menuItems) {
      if (menuItemStates[menuItem]) {
        // There can only be one handler active for each menu item, otherwise multiple save actions would
        // trigger when the user clicks the menu item. If we detect a stuck state (previous cleanup didn't run)
        // or duplicate registration, log a warning and forcefully take over
        console.warn(
          `Menu item ${menuItem} was already registered. This may indicate a previous instance failed ` +
            `to clean up or that two instances are trying to register the same menu item at the same time.`
        )
      }
    }

    // Set all states only after validation passes
    for (const menuItem of menuItems) {
      menuItemStates[menuItem] = true
    }

    // There's a slight change that the menu item state could get out of sync if the call
    // to setMenuItemsEnabled fails, but the chance of that should be zero.
    window.studio.ui.setMenuItemsEnabled(menuItems, true)

    return () => {
      for (const menuItem of menuItems) {
        menuItemStates[menuItem] = false
      }

      window.studio.ui.setMenuItemsEnabled(menuItems, false)
    }
  }, [hookId, crash])

  useEffect(() => {
    return window.studio.ui.onRequestSave(({ menuItem, saveAs }) => {
      if (!menuItemsRef.current.includes(menuItem)) {
        return
      }

      void saveFile({ saveAs })
    })
  }, [saveFile])

  return saveFile
}
