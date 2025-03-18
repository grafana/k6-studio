import { ToolBox } from './ToolBox'
import { ElementInspector } from './ElementInspector'
import { RemoteHighlights } from './RemoteHighlights'
import { useInBrowserUIStore } from './store'
import { EventDrawer } from './EventDrawer'
import { useState } from 'react'

export function InBrowserControls() {
  const tool = useInBrowserUIStore((state) => state.tool)
  const selectTool = useInBrowserUIStore((state) => state.selectTool)

  const [isDrawerOpen, setIsDrawerOpen] = useState(true)

  const handleInspectorEscape = () => {
    selectTool(null)
  }

  return (
    <>
      {tool === 'inspect' && (
        <ElementInspector onEscape={handleInspectorEscape} />
      )}
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
