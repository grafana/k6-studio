import { Button, DropdownMenu, IconButton } from '@radix-ui/themes'
import { EllipsisVerticalIcon } from 'lucide-react'

import { DeleteFileDialog } from '@/components/DeleteFileDialog'
import { useDeleteFile } from '@/hooks/useDeleteFile'
import { useOpenInDefaultApp } from '@/hooks/useOpenInDefaultApp'
import { StudioFile } from '@/types'

interface DataFileControlsProps {
  file: StudioFile
}

export function DataFileControls({ file }: DataFileControlsProps) {
  const handleOpenFolder = () => {
    window.studio.ui.openContainingFolder(file)
  }

  const handleOpenInDefaultApp = useOpenInDefaultApp(file)

  const handleDelete = useDeleteFile({
    file,
    navigateHomeOnDelete: true,
  })

  return (
    <>
      <Button variant="outline" onClick={handleOpenInDefaultApp}>
        Open in default app
      </Button>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="ghost" aria-label="Actions" color="gray">
            <EllipsisVerticalIcon />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onClick={handleOpenFolder}>
            Open containing folder
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DeleteFileDialog
            file={file}
            onConfirm={handleDelete}
            trigger={
              <DropdownMenu.Item
                color="red"
                onClick={(e) => e.preventDefault()}
              >
                Delete
              </DropdownMenu.Item>
            }
          />
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </>
  )
}
