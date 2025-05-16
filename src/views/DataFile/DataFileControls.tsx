import { Button, DropdownMenu, IconButton } from '@radix-ui/themes'
import { EllipsisVerticalIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useOpenInDefaultApp } from '@/hooks/useOpenInDefaultApp'
import { getRoutePath } from '@/routeMap'
import { StudioFile } from '@/types'
import { getFileNameWithoutExtension } from '@/utils/file'

interface DataFileControlsProps {
  fileName: string
}

export function DataFileControls({ fileName }: DataFileControlsProps) {
  const navigate = useNavigate()

  const file: StudioFile = {
    type: 'data-file',
    fileName,
    displayName: getFileNameWithoutExtension(fileName),
  }

  const handleOpenFolder = () => {
    window.studio.ui.openContainingFolder(file)
  }

  const handleOpenInDefaultApp = useOpenInDefaultApp(file)

  const handleDeleteFile = async () => {
    await window.studio.ui.deleteFile(file)
    navigate(getRoutePath('home'))
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
          <DropdownMenu.Item color="red" onClick={handleDeleteFile}>
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </>
  )
}
