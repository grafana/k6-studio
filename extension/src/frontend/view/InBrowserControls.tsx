import { useState } from 'react'

import { ElementInspector } from './ElementInspector'
import { EventDrawer } from './EventDrawer'
import { RemoteHighlights } from './RemoteHighlights'
import { useStudioClient } from './StudioClientProvider'
import { TextSelectionPopover } from './TextSelectionPopover'
import { ToolBox } from './ToolBox'
import { useBlockEventCapture, useInBrowserUIStore } from './store'

export function InBrowserControls() {
  const client = useStudioClient()

  const tool = useInBrowserUIStore((state) => state.tool)
  const selectTool = useInBrowserUIStore((state) => state.selectTool)

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const { blockEventCapture, unblockEventCapture } = useBlockEventCapture()

  const handleDeselectTool = () => {
    selectTool(null)
  }

  const handleStopRecording = () => {
    client.send({
      type: 'stop-recording',
    })
  }

  const handleDrawerOpenChange = (open: boolean) => {
    if (open) {
      blockEventCapture()
    } else {
      unblockEventCapture()
    }

    setIsDrawerOpen(open)
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
        onToggleDrawer={handleDrawerOpenChange}
      />
      <EventDrawer
        open={isDrawerOpen}
        editing={tool !== null}
        onOpenChange={handleDrawerOpenChange}
      />
    </>
  )
}
