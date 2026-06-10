import { Button, DropdownMenu, IconButton } from '@radix-ui/themes'
import {
  ChevronDownIcon,
  EllipsisVerticalIcon,
  MonitorIcon,
  ServerCogIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { emitScript } from '@/codegen/browser'
import { convertEventsToActions } from '@/codegen/browser/convertEventsToActions'
import { convertEventsToTest } from '@/codegen/browser/test'
import { RichDropdownMenuItem } from '@/components/RichDropdownMenuItem'
import { useCreateBrowserTest } from '@/hooks/useCreateBrowserTest'
import { useCreateGenerator } from '@/hooks/useCreateGenerator'
import { useDeleteFile } from '@/hooks/useDeleteFile'
import { useExportScript } from '@/hooks/useExportScript'
import { getRoutePath } from '@/routeMap'
import { BrowserEvent } from '@/schemas/recording'
import { useFeaturesStore } from '@/store/features'
import { ProxyData, StudioFile } from '@/types'
import {
  EventPage,
  groupEventsByPage,
  normalizeEntryNavigation,
} from '@/utils/browserEvents'

import { SelectPageDialog } from './SelectPageDialog'

function toPageActions(page: EventPage) {
  return convertEventsToActions(normalizeEntryNavigation(page.events))
}

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

  const [isSelectPageOpen, setIsSelectPageOpen] = useState(false)

  // Only offer pages that produce at least one browser action. Internal-only
  // tabs (e.g. a `chrome://new-tab-page/` that never navigated anywhere) would
  // otherwise show up in the picker and create an empty test.
  const pages = useMemo(
    () =>
      groupEventsByPage(browserEvents).filter(
        (page) => toPageActions(page).length > 0
      ),
    [browserEvents]
  )

  const handleCreateGenerator = () => createTestGenerator(file.path)

  const handleCreateBrowserTest = () => {
    if (pages.length > 1) {
      setIsSelectPageOpen(true)
      return
    }

    const page = pages[0]
    if (page) {
      void createBrowserTest(toPageActions(page))
    }
  }

  const handleSelectPage = (page: EventPage) => {
    setIsSelectPageOpen(false)
    void createBrowserTest(toPageActions(page))
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
            disabled={pages.length === 0}
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
          <DropdownMenu.Item
            color="red"
            onSelect={handleDeleteRecordingConfirm}
          >
            Move to Trash
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <SelectPageDialog
        open={isSelectPageOpen}
        onOpenChange={setIsSelectPageOpen}
        pages={pages}
        onSelectPage={handleSelectPage}
      />
    </>
  )
}
