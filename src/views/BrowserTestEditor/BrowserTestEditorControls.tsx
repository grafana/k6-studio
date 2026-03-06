import { Button, DropdownMenu, Flex, IconButton } from '@radix-ui/themes'
import { EllipsisVerticalIcon } from 'lucide-react'
import * as pathe from 'pathe'
import { useState } from 'react'

import { DeleteFileDialog } from '@/components/DeleteFileDialog'
import { RunInCloudDialog } from '@/components/RunInCloudDialog/RunInCloudDialog'
import { GrafanaIcon } from '@/components/icons/GrafanaIcon'
import { useDeleteFile } from '@/hooks/useDeleteFile'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'

import { DebugSession } from '../Validator/types'

interface BrowserTestEditorControlsProps {
  file: StudioFile
  preview: string
  session: DebugSession
  isDirty: boolean
  onStartDebugging: () => void
  onSave: () => void
}

export function BrowserTestEditorControls({
  file,
  preview,
  session,
  isDirty,
  onStartDebugging,
  onSave,
}: BrowserTestEditorControlsProps) {
  const [isRunInCloudDialogOpen, setIsRunInCloudDialogOpen] = useState(false)
  const showToast = useToast()

  const handleDelete = useDeleteFile({
    file,
    navigateHomeOnDelete: true,
  })

  const handleExportScript = async () => {
    try {
      const parsedPath = pathe.parse(file.path)

      const filePath = await window.studio.script.showSaveDialog(
        pathe.join(parsedPath.dir, parsedPath.name + '.js')
      )

      if (filePath === null) {
        return
      }

      await window.studio.script.saveScript(preview, filePath)

      showToast({
        title: 'Script exported successfully',
        status: 'success',
      })
    } catch (error) {
      console.error(error)

      showToast({
        title: 'Failed to export script',
        status: 'error',
      })
    }
  }

  return (
    <Flex align="center" gap="2">
      <Button variant="outline" onClick={onSave} disabled={!isDirty}>
        Save
      </Button>
      <Button
        variant="outline"
        onClick={onStartDebugging}
        loading={session.state === 'running'}
      >
        Debug script
      </Button>
      <Button onClick={() => setIsRunInCloudDialogOpen(true)}>
        <GrafanaIcon /> Run in Grafana Cloud
      </Button>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="ghost" color="gray">
            <EllipsisVerticalIcon />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onClick={handleExportScript}>
            Export script
          </DropdownMenu.Item>
          <DeleteFileDialog
            file={file}
            onConfirm={handleDelete}
            trigger={
              <DropdownMenu.Item
                color="red"
                onClick={(e) => e.preventDefault()}
              >
                Delete browser test
              </DropdownMenu.Item>
            }
          />
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <RunInCloudDialog
        open={isRunInCloudDialogOpen}
        script={{
          type: 'raw',
          name: file.fileName,
          content: preview,
        }}
        onOpenChange={setIsRunInCloudDialogOpen}
      />
    </Flex>
  )
}
