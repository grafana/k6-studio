import { ContextMenu, DropdownMenu, IconButton } from '@radix-ui/themes'
import { EllipsisIcon } from 'lucide-react'
import { PropsWithChildren } from 'react'
import { useNavigate } from 'react-router-dom'

import { getRoutePath } from '@/routeMap'
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

      <ContextMenu.Content size="1">
        {items.map((item) => (
          <ContextMenu.Item
            key={item.label}
            onClick={item.onClick}
            color={item.destructive ? 'red' : undefined}
          >
            {item.label}
          </ContextMenu.Item>
        ))}
      </ContextMenu.Content>
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

      <DropdownMenu.Content size="1">
        {items.map((item) => (
          <DropdownMenu.Item
            key={item.label}
            onClick={item.onClick}
            color={item.destructive ? 'red' : undefined}
          >
            {item.label}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
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
  const navigate = useNavigate()

  const handleOpenFolder = () => {
    window.studio.ui.openContainingFolder(file)
  }
  const handleDelete = async () => {
    await window.studio.ui.deleteFile(file)
    if (isSelected) {
      navigate(getRoutePath('home'))
    }
  }

  return [
    { label: 'Rename', onClick: onRename },
    { label: 'Open containing folder', onClick: handleOpenFolder },
    { label: 'Delete', onClick: handleDelete, destructive: true },
  ]
}

type FileContextMenuItem = {
  label: string
  onClick: () => void
  destructive?: boolean
}
