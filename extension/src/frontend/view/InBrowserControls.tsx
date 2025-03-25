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

  const handleInspectorEscape = () => {
    selectTool(null)
  }

  return (
    <>
      {tool === 'inspect' && (
        <ElementInspector onEscape={handleInspectorEscape} />
      )}
      {tool === 'assert-text' && <TextAssertionEditor />}
      <RemoteHighlights enabled={tool === null} />
      <ToolBox
        isDrawerOpen={isDrawerOpen}
        tool={tool}
        onSelectTool={selectTool}
        onToggleDrawer={setIsDrawerOpen}
      />
      <EventDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
    </>
  )
}
