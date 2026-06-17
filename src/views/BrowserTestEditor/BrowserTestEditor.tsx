import { css } from '@emotion/react'
import { Flex, Tabs } from '@radix-ui/themes'
import log from 'electron-log/renderer'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { FileNameHeader } from '@/components/FileNameHeader'
import { HighlightLocatorProvider } from '@/components/HighlightLocatorProvider'
import { View } from '@/components/Layout/View'
import { Group, Panel, Separator } from '@/components/primitives/ResizablePanel'
import {
  LogsSection,
  useConsoleFilter,
} from '@/components/Validator/LogsSection'
import { useSaveFile } from '@/hooks/useSaveFile'
import { getViewPath } from '@/routeMap'
import { BrowserTestFile } from '@/schemas/browserTest'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'

import { NetworkInspector } from '../Validator/Browser/NetworkInspector'

import {
  useBrowserScriptPreview,
  useBrowserTestEditorLayout,
  useBrowserTestState,
  useBrowserTestValidator,
} from './BrowserTestEditor.hooks'
import { BrowserTestEditorControls } from './BrowserTestEditorControls'
import { BrowserTestOptionsButton } from './BrowserTestOptionsButton'
import { BrowserTestPreview } from './BrowserTestPreview'
import { EditableBrowserActionList } from './EditableBrowserActionList'
import { BrowserActionStates, ContextMenuState } from './types'
import { ValidationProvider } from './ValidationProvider'

interface BrowserTestEditorProps {
  file: StudioFile
  initialData: BrowserTestFile
  isExternal: boolean
}

export function BrowserTestEditor({
  file,
  initialData,
  isExternal,
}: BrowserTestEditorProps) {
  const { drawerLayout, mainLayout, setDrawer, onTabClick } =
    useBrowserTestEditorLayout()

  const showToast = useToast()
  const navigate = useNavigate()

  const consoleFilter = useConsoleFilter()

  const [state, setState] = useState<ContextMenuState | null>(null)

  const { isDirty, markAsSaved, test, setTest } =
    useBrowserTestState(initialData)

  const previewScript = useBrowserScriptPreview(test.actions, test.options)

  const {
    session,
    shutdownDelay,
    setShutdownDelay,
    startDebugging,
    stopDebugging,
  } = useBrowserTestValidator({
    file,
    actions: test.actions,
    options: test.options,
  })

  const states = session.browser.actions.reduce<BrowserActionStates>(
    (acc, action) => {
      const eventId = action.eventId

      if (eventId === undefined) {
        return acc
      }

      acc[eventId] = [...(acc[eventId] ?? []), action]

      return acc
    },
    {}
  )

  const isValidating = session.state === 'running'

  const handleOptionsChange = (
    options:
      | BrowserTestFile['options']
      | ((prev: BrowserTestFile['options']) => BrowserTestFile['options'])
  ) => {
    setTest((prev) => ({
      ...prev,
      options: typeof options === 'function' ? options(prev.options) : options,
    }))
  }

  const handleActionsChange = (actions: BrowserTestFile['actions']) => {
    setTest((prev) => ({ ...prev, actions }))
  }

  const handleAddAction = (action: BrowserTestFile['actions'][number]) => {
    handleActionsChange([...test.actions, action])
  }

  const saveFile = useSaveFile({
    menuItems: {
      save: true,
      saveAs: true,
    },
    location: { type: 'file', path: file.path },
    content: () => ({
      type: 'browser-test' as const,
      data: {
        ...initialData,
        actions: test.actions,
        options: test.options,
      },
      isExternal: false,
    }),
    filters: [{ name: 'Browser Test', extensions: ['k6b'] }],
    onSave: (location) => {
      if (location.path === file.path) {
        markAsSaved()
      } else {
        navigate(getViewPath(location.path), { replace: true })
      }
    },
    onError: (error) => {
      showToast({
        title: 'Failed to save browser test',
        status: 'error',
        description: error.message,
      })
      log.error(error)
    },
  })

  const handleSave = () => {
    void saveFile({ saveAs: false })
  }

  return (
    <HighlightLocatorProvider>
      <ValidationProvider states={states} isValidating={isValidating}>
        <View
          title="Browser test"
          subTitle={<FileNameHeader file={file} canRename={!isExternal} />}
          actions={
            <BrowserTestEditorControls
              file={file}
              preview={previewScript}
              session={session}
              isDirty={isDirty}
              onStartDebugging={startDebugging}
              onStopDebugging={stopDebugging}
              onSave={handleSave}
            />
          }
        >
          <Flex flexGrow="1" direction="column" align="stretch">
            <Tabs.Root asChild defaultValue="console">
              <Flex
                css={css`
                  flex: 1 1 0;
                `}
                direction="column"
              >
                <Group
                  {...drawerLayout}
                  id="drawer"
                  css={css`
                    flex: 1 1 0;
                  `}
                  orientation="vertical"
                >
                  <Panel id="main">
                    <Group
                      {...mainLayout}
                      id="main"
                      css={css`
                        height: 100%;
                      `}
                    >
                      <Panel id="main" minSize={200}>
                        <BrowserTestPreview
                          state={state}
                          session={session}
                          previewScript={previewScript}
                          shutdownDelay={shutdownDelay}
                          onStateChange={setState}
                          onAddAction={handleAddAction}
                          onShutdownDelayChange={setShutdownDelay}
                        />
                      </Panel>
                      <Separator />
                      <Panel id="actions" defaultSize="30%" minSize={400}>
                        <EditableBrowserActionList
                          actions={test.actions}
                          optionsButton={
                            <BrowserTestOptionsButton
                              options={test.options}
                              onChange={handleOptionsChange}
                            />
                          }
                          onChange={handleActionsChange}
                        />
                      </Panel>
                    </Group>
                  </Panel>
                  <Separator />
                  <Tabs.List>
                    <Tabs.Trigger value="console" onClick={onTabClick}>
                      Console ({session.logs.length})
                    </Tabs.Trigger>
                    <Tabs.Trigger value="network" onClick={onTabClick}>
                      Network ({session.requests.length})
                    </Tabs.Trigger>
                  </Tabs.List>
                  <Separator data-disabled />
                  <Panel
                    id="drawer"
                    panelRef={setDrawer}
                    collapsible
                    defaultSize="30%"
                    minSize={100}
                  >
                    <Flex height="100%" direction="column" overflow="hidden">
                      <Tabs.Content
                        css={css`
                          overflow: hidden;
                          flex: 1 1 0;
                        `}
                        value="console"
                      >
                        <LogsSection
                          {...consoleFilter}
                          autoScroll={session.state === 'running'}
                          logs={session.logs}
                        />
                      </Tabs.Content>
                      <Tabs.Content
                        css={css`
                          overflow: hidden;
                          flex: 1 1 0;
                        `}
                        value="network"
                      >
                        <NetworkInspector session={session} />
                      </Tabs.Content>
                    </Flex>
                  </Panel>
                </Group>
              </Flex>
            </Tabs.Root>
          </Flex>
        </View>
      </ValidationProvider>
    </HighlightLocatorProvider>
  )
}
