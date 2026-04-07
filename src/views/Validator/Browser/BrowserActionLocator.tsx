import { toNodeSelector } from '@/codegen/browser/selectors'
import { Locator } from '@/components/Browser/Locator'
import { ActionLocator } from '@/main/runner/schema'
import { NodeSelector } from '@/schemas/selectors'

interface BrowserActionLocatorProps {
  locator: ActionLocator
  onHighlight?: (selector: NodeSelector | null) => void
}

export function BrowserActionLocator({
  locator,
  onHighlight,
}: BrowserActionLocatorProps) {
  const nodeLocator = toNodeSelector(locator)

  const handleHighlightChange = (highlighted: boolean) => {
    if (!highlighted || !onHighlight) {
      onHighlight?.(null)
      return
    }

    onHighlight(nodeLocator)
  }

  return (
    <Locator
      locator={nodeLocator}
      onHighlightChange={onHighlight ? handleHighlightChange : undefined}
    />
  )
}
