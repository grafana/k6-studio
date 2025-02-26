import { ElementHighlight } from './ElementHighlight'
import { useHighlightedElements } from './RemoteHighlights.hooks'

interface HighlighterProps {
  enabled?: boolean
}

/**
 * Highlights elements when hovering over selectors inside k6 Studio.
 */
export function RemoteHighlights({ enabled }: HighlighterProps) {
  const bounds = useHighlightedElements()

  if (!enabled) {
    return null
  }

  return (
    <>
      {enabled &&
        bounds.map((bound, index) => (
          <ElementHighlight key={index} bounds={bound} />
        ))}
    </>
  )
}
