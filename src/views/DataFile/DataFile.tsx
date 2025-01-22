import { View } from '@/components/Layout/View'
import { getFileNameWithoutExtension } from '@/utils/file'
import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { Button, DropdownMenu, IconButton } from '@radix-ui/themes'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

export function DataFile() {
  const { fileName } = useParams()
  invariant(fileName, 'fileName is required')

  const handleDeleteFile = async () => {
    await window.studio.ui.deleteFile({
      type: 'data-file',
      fileName,
      displayName: getFileNameWithoutExtension(fileName),
    })
  }

  return (
    <View
      title="Data file"
      subTitle={getFileNameWithoutExtension(fileName)}
      actions={
        <>
          <Button variant="outline">Open containing folder</Button>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton variant="ghost" aria-label="Actions" color="gray">
                <DotsVerticalIcon />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item color="red" onClick={handleDeleteFile}>
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </>
      }
    >
      Hello world
    </View>
  )
}
