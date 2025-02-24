import { ToolBox } from './ToolBox'
import { ElementInspector } from './ElementInspector'
import { RemoteHighlights } from './RemoteHighlights'
import { useAtom } from 'jotai'
import * as atoms from './atoms'

export function InBrowserControls() {
  const [tool, setTool] = useAtom(atoms.tool)

  const handleInspectorEscape = () => {
    setTool(null)
  }

  return (
    <>
      {tool === 'inspect' && (
        <ElementInspector onEscape={handleInspectorEscape} />
      )}
      <RemoteHighlights enabled={tool === null} />
      <ToolBox selected={tool} onSelect={setTool} />
    </>
  )
}
