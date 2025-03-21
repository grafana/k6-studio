import { ElementInspector } from './ElementInspector'
import { RemoteHighlights } from './RemoteHighlights'
import { ToolBox } from './ToolBox'
import { useInBrowserUIStore } from './store'

export function InBrowserControls() {
  const tool = useInBrowserUIStore((state) => state.tool)
  const selectTool = useInBrowserUIStore((state) => state.selectTool)

  const handleInspectorEscape = () => {
    selectTool(null)
  }

  return (
    <>
      {tool === 'inspect' && (
        <ElementInspector onEscape={handleInspectorEscape} />
      )}
      <RemoteHighlights enabled={tool === null} />
      <ToolBox selected={tool} onSelect={selectTool} />
    </>
  )
}
