import { Button, DropdownMenu, IconButton } from '@radix-ui/themes'
import {
  ChevronDownIcon,
  EllipsisVerticalIcon,
  MonitorIcon,
  ServerCogIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { emitScript } from '@/codegen/browser'
import { convertEventsToActions } from '@/codegen/browser/convertEventsToActions'
import { convertEventsToTest } from '@/codegen/browser/test'
import { FileInUseDialog } from '@/components/FileInUseDialog'
import { RichDropdownMenuItem } from '@/components/RichDropdownMenuItem'
import { useCreateBrowserTest } from '@/hooks/useCreateBrowserTest'
import { useCreateGenerator } from '@/hooks/useCreateGenerator'
import { useDeleteFile } from '@/hooks/useDeleteFile'
import { useExportScript } from '@/hooks/useExportScript'
import { getRoutePath } from '@/routeMap'
import { BrowserEvent } from '@/schemas/recording'
import { useFeaturesStore } from '@/store/features'
import { ProxyData, StudioFile } from '@/types'

interface RecordingPreviewControlsProps {
  file: StudioFile
  requests: ProxyData[]
  browserEvents: BrowserEvent[]
}

export function RecordingPreviewControls({
  file,
  requests,
  browserEvents,
}: RecordingPreviewControlsProps) {
  const navigate = useNavigate()
  const createTestGenerator = useCreateGenerator()

  // TODO: https://github.com/grafana/k6-studio/issues/277
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { state } = useLocation()
  // TODO: https://github.com/grafana/k6-studio/issues/277
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const isDiscardable = Boolean(state?.discardable)

  const isBrowserEditorEnabled = useFeaturesStore(
    (state) => state.features['browser-test-editor']
  )
  const createBrowserTest = useCreateBrowserTest()

  const [referencesToConfirm, setReferencesToConfirm] = useState<
    string[] | null
  >(null)

  const handleCreateGenerator = () => createTestGenerator(file.path)

  const handleCreateBrowserTest = () => {
    const actions = convertEventsToActions(browserEvents)
    void createBrowserTest(actions)
  }

  const browserTestDescription = isBrowserEditorEnabled
    ? 'Create a browser test from recorded interactions'
    : 'Export a k6 script simulating browser interactions'

  const deleteFile = useDeleteFile({
    file,
    navigateHomeOnDelete: false,
  })

  const handleDiscardConfirm = () => {
    void deleteFile({ force: true })

    navigate(getRoutePath('recorder'))
  }

  const handleDelete = async () => {
    const result = await deleteFile()

    if (result.deleted) {
      navigate(getRoutePath('home'))

      return
    }

    setReferencesToConfirm(result.references)
  }

  const handleConfirmDelete = () => {
    void deleteFile({ force: true })

    navigate(getRoutePath('home'))

    setReferencesToConfirm(null)
  }

  const handleCancelDelete = () => {
    setReferencesToConfirm(null)
  }

  const exportScript = useExportScript({
    enableMenuItem: browserEvents.length > 0,
    openOnSave: true,
    fileName: 'my-browser-script.js',
    content: async () => {
      const test = convertEventsToTest({
        browserEvents,
      })

      return await emitScript(test)
    },
  })

  const handleExportBrowserScript = () => {
    void exportScript()
  }

  const handleBrowserTest = isBrowserEditorEnabled
    ? handleCreateBrowserTest
    : handleExportBrowserScript

  return (
    <>
      {isDiscardable ? (
        <Button variant="outline" color="red" onClick={handleDiscardConfirm}>
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
          <RichDropdownMenuItem
            icon={<ServerCogIcon />}
            label="HTTP test"
            description="Generate a k6 script from HTTP requests using rules"
            disabled={requests.length === 0}
            onSelect={handleCreateGenerator}
          />
          <RichDropdownMenuItem
            icon={<MonitorIcon />}
            label="Browser test"
            description={browserTestDescription}
            disabled={browserEvents.length === 0}
            onSelect={handleBrowserTest}
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
          <DropdownMenu.Item color="red" onSelect={handleDelete}>
            Move to trash
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
