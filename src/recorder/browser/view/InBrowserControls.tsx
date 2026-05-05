import { useState } from 'react'

import { ElementInspector } from './ElementInspector'
import { EventDrawer } from './EventDrawer'
import { RemoteHighlights } from './RemoteHighlights'
import { useStudioClient } from './StudioClientProvider'
import { TextSelectionPopover } from './TextSelectionPopover'
import { ToolBox } from './ToolBox'
import { useRecordedEvents } from './hooks/useRecordedEvents'
import { useInBrowserUIStore } from './store'
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
      <RemoteHighlights />
      {tool === 'inspect' && <ElementInspector onClose={handleDeselectTool} />}
      {tool === 'assert-text' && (
        <TextSelectionPopover onClose={handleDeselectTool} />
      )}
      <ToolBox
        isDrawerOpen={isDrawerOpen}
        recordedEventCount={recordedEvents.length}
        tool={tool}
        onSelectTool={handleSelectTool}
        onStopRecording={handleStopRecording}
        onToggleDrawer={handleToggleDrawer}
      />
      <EventDrawer
        open={isDrawerOpen}
        events={recordedEvents}
        onOpenChange={handleToggleDrawer}
      />
    </>
  )
}
