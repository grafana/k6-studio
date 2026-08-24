import { useState } from 'react'

import { ElementInspector } from './ElementInspector'
import { ErrorBoundary } from './ErrorBoundary'
import { EventDrawer } from './EventDrawer'
import { useRecordedEvents } from './hooks/useRecordedEvents'
import { RemoteHighlights } from './RemoteHighlights'
import { useInBrowserUIStore } from './store'
import { useStudioClient } from './StudioClientProvider'
import { TextSelectionPopover } from './TextSelectionPopover'
import { ToolBox } from './ToolBox'
import { Tool } from './types'

export function InBrowserControls() {
  const client = useStudioClient()

  const tool = useInBrowserUIStore((state) => state.tool)
  const selectTool = useInBrowserUIStore((state) => state.selectTool)

  const recordedEvents = useRecordedEvents()

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleSelectTool = (tool: Tool | null) => {
    setIsDrawerOpen(false)
    selectTool(tool)
  }

  const handleDeselectTool = () => {
    selectTool(null)
  }

  const handleToggleDrawer = (open: boolean) => {
    if (open) {
      selectTool(null)
    }

    setIsDrawerOpen(open)
  }

  const handleStopRecording = () => {
    client.send({
      type: 'stop-recording',
    })
  }

  return (
    <>
      <ErrorBoundary name="Remote highlights">
        <RemoteHighlights />
      </ErrorBoundary>
      {/*
        The boundaries sit inside the conditionals so that selecting a tool
        again mounts a fresh one, giving a crashed tool another chance.
      */}
      {tool === 'inspect' && (
        <ErrorBoundary name="Element inspector" onError={handleDeselectTool}>
          <ElementInspector onClose={handleDeselectTool} />
        </ErrorBoundary>
      )}
      {tool === 'assert-text' && (
        <ErrorBoundary name="Text selection" onError={handleDeselectTool}>
          <TextSelectionPopover onClose={handleDeselectTool} />
        </ErrorBoundary>
      )}
      <ErrorBoundary name="Toolbox">
        <ToolBox
          isDrawerOpen={isDrawerOpen}
          recordedEventCount={recordedEvents.length}
          tool={tool}
          onSelectTool={handleSelectTool}
          onStopRecording={handleStopRecording}
          onToggleDrawer={handleToggleDrawer}
        />
      </ErrorBoundary>
      <ErrorBoundary name="Event drawer">
        <EventDrawer
          open={isDrawerOpen}
          events={recordedEvents}
          onOpenChange={handleToggleDrawer}
        />
      </ErrorBoundary>
    </>
  )
}
