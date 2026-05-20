import { useMutation } from '@tanstack/react-query'
import { FileFilter } from 'electron'
import { useEffect, useRef } from 'react'

import { FileContent, FileLocation, StorageLocation } from '@/handlers/fs/types'
import { MenuItem } from '@/handlers/ui/types'

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
  onSuccess?: (location: FileLocation | undefined) => void
  onError?: (error: Error) => void
}

export function useSaveFile({
  menuItems = [],
  location,
  content,
  filters,
  onSuccess,
  onError,
}: UseSaveFileOptions) {
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
    onSuccess,
    onError,
  })

  useEffect(() => {
    const menuItems = menuItemsRef.current

    for (const menuItem of menuItems) {
      if (menuItemStates[menuItem]) {
        console.error(
          `Menu item ${menuItem} is already enabled by another useSaveFile. Only one useSaveFile should be enabled at a time.`
        )
      }

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
  }, [])

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
