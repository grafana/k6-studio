import { useState } from 'react'

import { ElementInspector } from './ElementInspector'
import { EventDrawer } from './EventDrawer'
import { RemoteHighlights } from './RemoteHighlights'
import { useStudioClient } from './StudioClientProvider'
import { TextSelectionPopover } from './TextSelectionPopover'
import { ToolBox } from './ToolBox'
import { useInBrowserUIStore } from './store'

export function InBrowserControls() {
  const client = useStudioClient()

  const tool = useInBrowserUIStore((state) => state.tool)
  const selectTool = useInBrowserUIStore((state) => state.selectTool)

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleDeselectTool = () => {
    selectTool(null)
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
        tool={tool}
        onSelectTool={selectTool}
        onStopRecording={handleStopRecording}
        onToggleDrawer={setIsDrawerOpen}
      />
      <EventDrawer
        open={isDrawerOpen}
        editing={tool !== null}
        onOpenChange={setIsDrawerOpen}
      />
    </>
  )
}
