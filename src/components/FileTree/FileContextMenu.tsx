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

      <ContextMenu.Content size="1">
        {items.map((item) =>
          item.destructive ? (
            <DeleteFileDialog
              key={item.label}
              file={file}
              onConfirm={item.onClick}
              trigger={
                <div style={{ color: 'red', cursor: 'pointer' }}>
                  {item.label}
                </div>
              }
            />
          ) : (
            <ContextMenu.Item key={item.label} onClick={item.onClick}>
              {item.label}
            </ContextMenu.Item>
          )
        )}
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
        {items.map((item) =>
          item.destructive ? (
            <DeleteFileDialog
              key={item.label}
              file={file}
              onConfirm={item.onClick}
              trigger={
                <div
                  style={{
                    color: 'red',
                    cursor: 'pointer',
                    padding: '4px 6px',
                  }}
                >
                  {item.label}
                </div>
              }
            />
          ) : (
            <DropdownMenu.Item key={item.label} onClick={item.onClick}>
              {item.label}
            </DropdownMenu.Item>
          )
        )}
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
