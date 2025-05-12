import { useState } from 'react'

import { client } from '../routing'

import { ElementInspector } from './ElementInspector'
import { EventDrawer } from './EventDrawer'
import { RemoteHighlights } from './RemoteHighlights'
import { TextAssertionEditor } from './TextAssertionEditor'
import { ToolBox } from './ToolBox'
import { useInBrowserUIStore } from './store'

export function InBrowserControls() {
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
        <TextAssertionEditor onClose={handleDeselectTool} />
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
