import { css } from '@emotion/react'
import { DropdownMenu, IconButton } from '@radix-ui/themes'
import { VideoIcon, ServerCogIcon, CodeIcon, Download } from 'lucide-react'
import { useState } from 'react'

import { RichDropdownMenuItem } from '@/components/RichDropdownMenuItem'
import { useCreateGenerator } from '@/hooks/useCreateGenerator'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'
import * as path from '@/utils/path'
import { proxyDataToHar } from '@/utils/proxyDataToHar'

import { DebugSession } from '../types'

import { ExportScriptDialog } from './ExportScriptDialog'

function formatRecordingHint(filePath: string) {
  return `${path.name(filePath)}.har`
}

interface ExportNetworkTrafficButtonProps {
  file: StudioFile
  session: DebugSession
}

export function ExportNetworkTrafficButton({
  file,
  session,
}: ExportNetworkTrafficButtonProps) {
  const showToast = useToast()
  const createGenerator = useCreateGenerator()

  const [isScriptDialogOpen, setIsScriptDialogOpen] = useState(false)

  const handleExportRecording = async () => {
    try {
      const har = proxyDataToHar(session.requests, [])

      await window.studio.har.exportFile(har, formatRecordingHint(file.path))
    } catch {
      showToast({
        title: 'Failed to export recording.',
        status: 'error',
      })
    }
  }

  const handleExportGenerator = async () => {
    try {
      const har = proxyDataToHar(session.requests, [])
      const recordingPath = await window.studio.har.exportFile(
        har,
        formatRecordingHint(file.path)
      )

      if (recordingPath === undefined) {
        return
      }

      await createGenerator(recordingPath)
    } catch {
      showToast({
        title: 'Failed to create generator.',
        status: 'error',
      })
    }
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger disabled={session.state !== 'stopped'}>
          <IconButton
            css={css`
              margin: 0;
            `}
            size="1"
            color="gray"
            variant="ghost"
          >
            <Download size={16} />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <RichDropdownMenuItem
            icon={<VideoIcon size={16} />}
            label="Recording"
            description="Save as a recording"
            onClick={handleExportRecording}
          />
          <RichDropdownMenuItem
            icon={<ServerCogIcon size={16} />}
            label="Generator"
            description="Save as a recording and use it in a new generator"
            onClick={handleExportGenerator}
          />
          <RichDropdownMenuItem
            icon={<CodeIcon size={16} />}
            label="Script"
            description="Generate a k6 script from the network traffic"
            onClick={() => setIsScriptDialogOpen(true)}
          />
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <ExportScriptDialog
        key={session.id}
        open={isScriptDialogOpen}
        onOpenChange={setIsScriptDialogOpen}
        requests={session.requests}
      />
    </>
  )
}
