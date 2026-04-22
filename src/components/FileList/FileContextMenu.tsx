import { ContextMenu, DropdownMenu, IconButton } from '@radix-ui/themes'
import { EllipsisIcon } from 'lucide-react'
import { PropsWithChildren } from 'react'

import { DeleteFileDialog } from '@/components/DeleteFileDialog'
import { useDeleteFile } from '@/hooks/useDeleteFile'
import { StudioFile } from '@/types'

interface FileContextMenuProps {
  file: StudioFile
  isSelected: boolean
  onRename: () => void
}

export function FileContextMenu({
  file,
  children,
  isSelected,
  onRename,
}: PropsWithChildren<FileContextMenuProps>) {
  const items = useFileContextMenuItems({ file, isSelected, onRename })

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>{children}</ContextMenu.Trigger>

      <SharedFileMenuContent
        file={file}
        items={items}
        MenuContent={ContextMenu.Content}
        MenuItemComponent={ContextMenu.Item}
      />
    </ContextMenu.Root>
  )
}

export function FileActionsMenu({
  file,
  isSelected,
  onRename,
}: FileContextMenuProps) {
  const items = useFileContextMenuItems({ file, isSelected, onRename })

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton variant="ghost" aria-label="Actions" color="gray" size="1">
          <EllipsisIcon />
        </IconButton>
      </DropdownMenu.Trigger>

      <SharedFileMenuContent
        file={file}
        items={items}
        MenuContent={DropdownMenu.Content}
        MenuItemComponent={DropdownMenu.Item}
      />
    </DropdownMenu.Root>
  )
}

interface UseFileContextMenuItemsArgs {
  file: StudioFile
  isSelected: boolean
  onRename: () => void
}

function useFileContextMenuItems({
  file,
  isSelected,
  onRename,
}: UseFileContextMenuItemsArgs): FileContextMenuItem[] {
  const handleOpenFolder = () => {
    window.studio.ui.openContainingFolder(file)
  }

  const handleDelete = useDeleteFile({
    file,
    navigateHomeOnDelete: isSelected,
  })

  return [
    { label: 'Rename', onClick: onRename },
    { label: 'Open containing folder', onClick: handleOpenFolder },
    { label: 'Delete', destructive: true, onClick: handleDelete },
  ]
}

type FileContextMenuItem = {
  label: string
  onClick: () => void | Promise<void>
  destructive?: boolean
}

type MenuItemComponent = typeof ContextMenu.Item | typeof DropdownMenu.Item
type MenuContentComponent =
  | typeof ContextMenu.Content
  | typeof DropdownMenu.Content

interface SharedFileMenuContentProps {
  file: StudioFile
  items: FileContextMenuItem[]
  MenuContent: MenuContentComponent
  MenuItemComponent: MenuItemComponent
}

function SharedFileMenuContent({
  file,
  items,
  MenuContent,
  MenuItemComponent,
}: SharedFileMenuContentProps) {
  return (
    <MenuContent size="1">
      {items.map((item) => (
        <SharedMenuItem
          key={item.label}
          file={file}
          item={item}
          MenuItemComponent={MenuItemComponent}
        />
      ))}
    </MenuContent>
  )
}

interface SharedMenuItemProps {
  file: StudioFile
  item: FileContextMenuItem
  MenuItemComponent: MenuItemComponent
}

function SharedMenuItem({
  file,
  item,
  MenuItemComponent,
}: SharedMenuItemProps) {
  if (item.destructive) {
    return (
      <DeleteFileDialog
        file={file}
        onConfirm={item.onClick}
        trigger={
          <MenuItemComponent
            color="red"
            onSelect={(event) => event.preventDefault()}
            onClick={(event) => event.preventDefault()}
          >
            {item.label}
          </MenuItemComponent>
        }
      />
    )
  }

  return (
    <MenuItemComponent onClick={item.onClick}>{item.label}</MenuItemComponent>
  )
}
