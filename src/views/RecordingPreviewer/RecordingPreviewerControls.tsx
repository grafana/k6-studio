import { css } from '@emotion/react'
import { Button, DropdownMenu, Flex, IconButton, Text } from '@radix-ui/themes'
import { ChevronDownIcon, EllipsisVerticalIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { emitScript } from '@/codegen/browser'
import { convertToTest } from '@/codegen/browser/test'
import { useCreateGenerator } from '@/hooks/useCreateGenerator'
import { getRoutePath } from '@/routeMap'
import { BrowserEvent } from '@/schemas/recording'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'

import { ExportScriptDialog } from '../Generator/ExportScriptDialog'

interface RecordingPreviewControlsProps {
  file: StudioFile
  browserEvents: BrowserEvent[]
}

export function RecordingPreviewControls({
  file,
  browserEvents,
}: RecordingPreviewControlsProps) {
  const [showExportDialog, setShowExportDialog] = useState(false)
  const showToast = useToast()
  const navigate = useNavigate()
  const createTestGenerator = useCreateGenerator()
  const { fileName } = useParams()

  // TODO: https://github.com/grafana/k6-studio/issues/277
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { state } = useLocation()
  // TODO: https://github.com/grafana/k6-studio/issues/277
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const isDiscardable = Boolean(state?.discardable)

  const handleCreateGenerator = () => createTestGenerator(fileName)

  const handleDeleteRecording = async () => {
    await window.studio.ui.deleteFile(file)
    navigate(getRoutePath('home'))
  }

  const handleDiscard = async () => {
    await window.studio.ui.deleteFile(file)
    navigate(getRoutePath('recorder'))
  }

  const handleExportBrowserScript = (fileName: string) => {
    const test = convertToTest({
      browserEvents,
    })

    emitScript(test)
      .then((script) => window.studio.script.saveScript(script, fileName))
      .then(() => {
        navigate(
          getRoutePath('validator', {
            fileName: encodeURIComponent(fileName),
          })
        )
      })
      .catch((err) => {
        console.error(err)

        showToast({
          title: 'Failed to export browser script.',
          status: 'error',
        })
      })
  }

  return (
    <>
      {isDiscardable ? (
        <Button onClick={handleDiscard} variant="outline" color="red">
          Discard
        </Button>
      ) : (
        <Button variant="outline" asChild>
          <Link to={getRoutePath('recorder')}>New recording</Link>
        </Button>
      )}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button>
            Create test <ChevronDownIcon />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <MenuItem
            label="HTTP test"
            description="Generate a k6 script from HTTP requests using rules"
            onClick={handleCreateGenerator}
          />
          <MenuItem
            label="Browser test"
            description="Export a k6 script simulating browser interactions"
            disabled={browserEvents.length === 0}
            onClick={() => setShowExportDialog(true)}
          />
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="ghost" aria-label="Actions" color="gray">
            <EllipsisVerticalIcon />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item color="red" onClick={handleDeleteRecording}>
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <ExportScriptDialog
        open={showExportDialog}
        scriptName="my-browser-script.js"
        onOpenChange={setShowExportDialog}
        onExport={handleExportBrowserScript}
      />
    </>
  )
}

interface MenuItemProps {
  label: string
  description?: string
  disabled?: boolean
  onClick?: () => void
}

function MenuItem({ label, description, disabled, onClick }: MenuItemProps) {
  return (
    <DropdownMenu.Item
      disabled={disabled}
      onClick={onClick}
      css={css`
        height: auto;
      `}
    >
      <Flex direction="column" align="start" py="1" maxWidth="320px">
        <Text>{label}</Text>
        {description && <Text size="1">{description}</Text>}
      </Flex>
    </DropdownMenu.Item>
  )
}
