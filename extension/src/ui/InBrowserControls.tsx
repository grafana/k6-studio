import { ToolBox } from './ToolBox'
import { Inspector } from './Inspector'
import { Highlighter } from './Highlighter'
import { useAtom } from 'jotai'
import * as atoms from './atoms'

export function InBrowserControls() {
  const [tool, setTool] = useAtom(atoms.tool)

  const handleInspectorEscape = () => {
    setTool(null)
  }

  return (
    <>
      {tool === 'inspect' && <Inspector onEscape={handleInspectorEscape} />}
      <Highlighter enabled={tool === null} />
      <ToolBox selected={tool} onSelect={setTool} />
    </>
  )
}
