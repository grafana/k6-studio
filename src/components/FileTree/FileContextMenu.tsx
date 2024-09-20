import { getRoutePath } from '@/routeMap'
import { ContextMenu } from '@radix-ui/themes'
import { PropsWithChildren } from 'react'
import { useNavigate } from 'react-router-dom'

interface FileContextMenuProps {
  path: string
  isSelected: boolean
  handleRename: () => void
}

export function FileContextMenu({
  path,
  children,
  isSelected,
  handleRename,
}: PropsWithChildren<FileContextMenuProps>) {
  const navigate = useNavigate()

  const handleOpenFolder = () => {
    window.studio.ui.openContainingFolder(path)
  }
  const handleDelete = async () => {
    await window.studio.ui.deleteFile(path)
    if (isSelected) {
      navigate(getRoutePath('home'))
    }
  }

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>{children}</ContextMenu.Trigger>
      <ContextMenu.Content size="1">
        <ContextMenu.Item onClick={handleRename}>Rename</ContextMenu.Item>
        <ContextMenu.Item onClick={handleOpenFolder}>
          Open containing folder
        </ContextMenu.Item>
        <ContextMenu.Item color="red" onClick={handleDelete}>
          Delete
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}
