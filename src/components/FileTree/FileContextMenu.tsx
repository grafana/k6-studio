import { ContextMenu, DropdownMenu, IconButton } from '@radix-ui/themes'
import { EllipsisIcon } from 'lucide-react'
import { PropsWithChildren } from 'react'

import { useDeleteFile } from '@/hooks/useDeleteFile'
import { StudioFile } from '@/types'

interface FileContextMenuProps {
  file: StudioFile
  onRename: () => void
}

export function FileContextMenu({
  file,
  children,
  onRename,
}: PropsWithChildren<FileContextMenuProps>) {
  const items = useFileContextMenuItems({ file, onRename })

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>{children}</ContextMenu.Trigger>

      <SharedFileMenuContent
        items={items}
        MenuContent={ContextMenu.Content}
        MenuItemComponent={ContextMenu.Item}
      />
    </ContextMenu.Root>
  )
}

export function FileActionsMenu({ file, onRename }: FileContextMenuProps) {
  const items = useFileContextMenuItems({ file, onRename })

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton variant="ghost" aria-label="Actions" color="gray" size="1">
          <EllipsisIcon />
        </IconButton>
      </DropdownMenu.Trigger>

      <SharedFileMenuContent
        items={items}
        MenuContent={DropdownMenu.Content}
        MenuItemComponent={DropdownMenu.Item}
      />
    </DropdownMenu.Root>
  )
}

interface UseFileContextMenuItemsArgs {
  file: StudioFile
  onRename: () => void
}

function useFileContextMenuItems({
  file,
  onRename,
}: UseFileContextMenuItemsArgs): FileContextMenuItem[] {
  const handleOpenFolder = () => {
    window.studio.ui.openContainingFolder(file)
  }

  const handleDelete = useDeleteFile({
    file,
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
  items: FileContextMenuItem[]
  MenuContent: MenuContentComponent
  MenuItemComponent: MenuItemComponent
}

function SharedFileMenuContent({
  items,
  MenuContent,
  MenuItemComponent,
}: SharedFileMenuContentProps) {
  return (
    <MenuContent size="1">
      {items.map((item) => (
        <MenuItemComponent
          key={item.label}
          color={item.destructive ? 'red' : undefined}
          onClick={item.onClick}
        >
          {item.label}
        </MenuItemComponent>
      ))}
    </MenuContent>
  )
}
