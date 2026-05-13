import { Button, DropdownMenu, IconButton } from '@radix-ui/themes'
import {
  ChevronDownIcon,
  EllipsisVerticalIcon,
  MonitorIcon,
  ServerCogIcon,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { emitScript } from '@/codegen/browser'
import { convertEventsToActions } from '@/codegen/browser/convertEventsToActions'
import { convertEventsToTest } from '@/codegen/browser/test'
import { DeleteFileDialog } from '@/components/DeleteFileDialog'
import { RichDropdownMenuItem } from '@/components/RichDropdownMenuItem'
import { useCreateBrowserTest } from '@/hooks/useCreateBrowserTest'
import { useCreateGenerator } from '@/hooks/useCreateGenerator'
import { useDeleteFile } from '@/hooks/useDeleteFile'
import { getRoutePath, getViewPath } from '@/routeMap'
import { BrowserEvent } from '@/schemas/recording'
import { useFeaturesStore } from '@/store/features'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'

interface RecordingPreviewControlsProps {
  file: StudioFile
  browserEvents: BrowserEvent[]
}

export function RecordingPreviewControls({
  file,
  browserEvents,
}: RecordingPreviewControlsProps) {
  const showToast = useToast()
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

  const handleCreateGenerator = () => createTestGenerator(file.path)

  const handleCreateBrowserTest = () => {
    const actions = convertEventsToActions(browserEvents)
    void createBrowserTest(actions)
  }

  const browserTestDescription = isBrowserEditorEnabled
    ? 'Create a browser test from recorded interactions'
    : 'Export a k6 script simulating browser interactions'

  const handleDelete = useDeleteFile({
    file,
    navigateHomeOnDelete: false,
  })

  const handleDiscardConfirm = () => {
    handleDelete()
    navigate(getRoutePath('recorder'))
  }

  const handleDeleteRecordingConfirm = () => {
    handleDelete()
    navigate(getRoutePath('home'))
  }

  const handleExportBrowserScript = async () => {
    const test = convertEventsToTest({
      browserEvents,
    })

    try {
      const path = await window.studio.fs.showSaveAsDialog(
        'my-browser-script.js'
      )

      if (path === undefined) {
        return
      }

      const script = await emitScript(test)

      await window.studio.script.saveScript(path, script)

      navigate(getViewPath('script', path))
    } catch (err) {
      showToast({
        title: 'Failed to export browser script.',
        status: 'error',
      })
    }
  }

  const handleBrowserTest = isBrowserEditorEnabled
    ? handleCreateBrowserTest
    : handleExportBrowserScript

  return (
    <>
      {isDiscardable ? (
        <DeleteFileDialog
          file={file}
          actionLabel="Discard"
          description="Discard this recording? This cannot be undone."
          onConfirm={handleDiscardConfirm}
          trigger={
            <Button variant="outline" color="red">
              Discard
            </Button>
          }
        />
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
            onClick={handleCreateGenerator}
          />
          <RichDropdownMenuItem
            icon={<MonitorIcon />}
            label="Browser test"
            description={browserTestDescription}
            disabled={browserEvents.length === 0}
            onClick={handleBrowserTest}
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
          <DeleteFileDialog
            file={file}
            onConfirm={handleDeleteRecordingConfirm}
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
