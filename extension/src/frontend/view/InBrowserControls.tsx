import { useState } from 'react'

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

  return (
    <>
      {tool === 'inspect' && <ElementInspector onCancel={handleDeselectTool} />}
      {tool === 'assert-text' && (
        <TextAssertionEditor onClose={handleDeselectTool} />
      )}
      <RemoteHighlights enabled={tool !== 'inspect'} />
      <ToolBox
        isDrawerOpen={isDrawerOpen}
        tool={tool}
        onSelectTool={selectTool}
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
