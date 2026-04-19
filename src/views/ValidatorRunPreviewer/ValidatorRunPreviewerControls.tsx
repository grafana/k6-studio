import { Button } from '@radix-ui/themes'
import { useNavigate } from 'react-router-dom'

import { DeleteFileDialog } from '@/components/DeleteFileDialog'
import { useDeleteFile } from '@/hooks/useDeleteFile'
import { getRoutePath } from '@/routeMap'
import { StudioFile } from '@/types'

interface ValidatorRunPreviewerControlsProps {
  file: StudioFile
}

export function ValidatorRunPreviewerControls({
  file,
}: ValidatorRunPreviewerControlsProps) {
  const navigate = useNavigate()

  const handleDelete = useDeleteFile({
    file,
    navigateHomeOnDelete: false,
  })

  const handleDeleteConfirm = async () => {
    await handleDelete()
    navigate(getRoutePath('home'))
  }

  return (
    <DeleteFileDialog
      file={file}
      onConfirm={handleDeleteConfirm}
      trigger={<Button variant="outline">Delete</Button>}
    />
  )
}
