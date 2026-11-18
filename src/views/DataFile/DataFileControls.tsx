import { Button, DropdownMenu, IconButton } from '@radix-ui/themes'
import { EllipsisVerticalIcon } from 'lucide-react'
import { useState } from 'react'

import { FileInUseDialog } from '@/components/FileInUseDialog'
import { useDeleteFile } from '@/hooks/useDeleteFile'
import { useOpenInDefaultApp } from '@/hooks/useOpenInDefaultApp'
import { StudioFile } from '@/types'

interface DataFileControlsProps {
  file: StudioFile
}

export function DataFileControls({ file }: DataFileControlsProps) {
  const [referencesToConfirm, setReferencesToConfirm] = useState<
    string[] | null
  >(null)

  const handleOpenFolder = () => {
    window.studio.ui.openContainingFolder(file)
  }

  const handleOpenInDefaultApp = useOpenInDefaultApp(file)

  const deleteFile = useDeleteFile({
    file,
    navigateHomeOnDelete: true,
  })

  const handleDelete = async () => {
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
          <DropdownMenu.Item color="red" onClick={handleDelete}>
            Move to Trash
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
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
