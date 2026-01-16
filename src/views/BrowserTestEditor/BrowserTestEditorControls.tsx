import { Button, DropdownMenu, Flex, IconButton } from '@radix-ui/themes'
import { EllipsisVerticalIcon } from 'lucide-react'
import { useState } from 'react'

import { DeleteFileDialog } from '@/components/DeleteFileDialog'
import { RunInCloudDialog } from '@/components/RunInCloudDialog/RunInCloudDialog'
import { GrafanaIcon } from '@/components/icons/GrafanaIcon'
import { useDeleteFile } from '@/hooks/useDeleteFile'
import { BrowserTestFile } from '@/schemas/browserTest/v1'
import { StudioFile } from '@/types'

import { ExportScriptDialog } from '../Generator/ExportScriptDialog'
import { DebugSession } from '../Validator/types'

import { useSaveBrowserTest } from './BrowserTestEditor.hooks'

interface BrowserTestEditorControlsProps {
  data: BrowserTestFile
  file: StudioFile
  preview: string
  session: DebugSession
  onStartDebugging: () => void
}

export function BrowserTestEditorControls({
  data,
  file,
  preview,
  session,
  onStartDebugging,
}: BrowserTestEditorControlsProps) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isRunInCloudDialogOpen, setIsRunInCloudDialogOpen] = useState(false)
  const { mutateAsync: saveBrowserTest } = useSaveBrowserTest(file.fileName)

  const handleDelete = useDeleteFile({
    file,
    navigateHomeOnDelete: true,
  })

  const handleExportScript = (scriptName: string) => {
    void window.studio.script.saveScript(preview, scriptName)
  }

  // TODO: currently re-saves the opened file without changes.
  // Replace with actual save logic when adding browser actions is implemented.
  const handleSave = () => {
    if (!data) {
      return
    }

    void saveBrowserTest(data)
  }

  return (
    <Flex align="center" gap="2">
      <Button variant="outline" onClick={handleSave}>
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
          <DropdownMenu.Item onClick={() => setIsExportDialogOpen(true)}>
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
      <ExportScriptDialog
        scriptName={`${file.displayName}.js`}
        onExport={handleExportScript}
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
      />
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
