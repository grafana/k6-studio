import { useState } from 'react'

import { ElementInspector } from './ElementInspector'
import { EventDrawer } from './EventDrawer'
import { RemoteHighlights } from './RemoteHighlights'
import { TextSelectionPopover } from './TextSelectionPopover'
import { ToolBox } from './ToolBox'
import { useBrowserExtensionClient } from './hooks/useBrowserExtensionClient'
import { useInBrowserUIStore } from './store'

export function InBrowserControls() {
  const tool = useInBrowserUIStore((state) => state.tool)

  const client = useBrowserExtensionClient()
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
