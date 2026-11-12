import { ContextMenu, DropdownMenu, IconButton } from '@radix-ui/themes'
import { EllipsisIcon } from 'lucide-react'
import { ReactNode, useState, useRef } from 'react'

import { useDeleteFile } from '@/hooks/useDeleteFile'
import { StudioFile } from '@/types'

import { FileInUseDialog } from '../FileInUseDialog'

type MenuComponent = typeof DropdownMenu | typeof ContextMenu

interface MenuComponentProps {
  file: StudioFile
  isSelected: boolean
  children: ReactNode
  onRename: () => void
}

function makeMenuComponent(
  { Root, Trigger, Content, Separator, Item }: MenuComponent,
  contentProps: ContextMenu.ContentProps | DropdownMenu.ContentProps = {}
) {
  return ({ file, isSelected, children, onRename }: MenuComponentProps) => {
    const focusTriggerOnClose = useRef(true)

    const [referencesToConfirm, setReferencesToConfirm] = useState<
      string[] | null
    >(null)

    const deleteFile = useDeleteFile({
      file,
      navigateHomeOnDelete: isSelected,
    })

    const handleOpenChange = (open: boolean) => {
      if (open) {
        focusTriggerOnClose.current = true
      }
    }

    const handleCloseAutoFocus = (event: Event) => {
      if (!focusTriggerOnClose.current) {
        event.preventDefault()
      }
    }

    const handleRename = () => {
      // When renaming a file the focus will move to the file name input. We need
      // to block the trigger from steam the focus back when the menu closes.
      focusTriggerOnClose.current = false

      onRename()
    }

    const handleDeleteFile = async () => {
      const result = await deleteFile()

      if (result.deleted) {
        return
      }

      setReferencesToConfirm(result.references)
    }

    const handleConfirmDelete = () => {
      void deleteFile({ force: true })

      setReferencesToConfirm(null)
    }

    const handleCancelDelete = () => {
      setReferencesToConfirm(null)
    }

    const handleOpenFolder = () => {
      window.studio.ui.openContainingFolder(file)
    }

    return (
      <>
        <Root onOpenChange={handleOpenChange}>
          <Trigger>{children}</Trigger>
          <Content onCloseAutoFocus={handleCloseAutoFocus} {...contentProps}>
            <Item onSelect={handleRename}>Rename</Item>
            <Item onSelect={handleOpenFolder}>Open containing folder</Item>
            <Separator />
            <Item color="red" onSelect={handleDeleteFile}>
              Move to trash
            </Item>
          </Content>
        </Root>
        <FileInUseDialog
          open={referencesToConfirm !== null}
          filePath={file.path}
          references={referencesToConfirm ?? []}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      </>
    )
  }
}

interface FileContextMenuProps {
  file: StudioFile
  isSelected: boolean
  children: ReactNode
  onRename: () => void
}

const ContextMenuComponent = makeMenuComponent(ContextMenu)
const DropdownMenuComponent = makeMenuComponent(DropdownMenu, {
  side: 'bottom',
  align: 'end',
})

export function FileContextMenu(props: FileContextMenuProps) {
  return <ContextMenuComponent {...props} />
}

export function FileActionsMenu(props: Omit<MenuComponentProps, 'children'>) {
  return (
    <DropdownMenuComponent {...props}>
      <IconButton variant="ghost" aria-label="Actions" color="gray" size="1">
        <EllipsisIcon />
      </IconButton>
    </DropdownMenuComponent>
  )
}
