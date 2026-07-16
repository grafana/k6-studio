import { useEffect, useState } from 'react'

import { ElementHighlights } from '@/components/Browser/ElementHighlights'
import { ElementLocator } from '@/schemas/locator'

import { useStudioClient } from './StudioClientProvider'

/**
 * Highlights elements when hovering over selectors inside k6 Studio.
 *
 * Only handles messages that target the top frame's own document. A message
 * with a non-empty `frames` chain targets a (possibly cross-origin) child
 * frame instead, which draws its own highlight locally via
 * `attachFrameHighlights`; same-origin children run that same listener, so
 * every frame highlights itself uniformly rather than the top frame
 * descending into them.
 */
export function RemoteHighlights() {
  const client = useStudioClient()

  const [locator, setLocator] = useState<ElementLocator | null>(null)
  const [targetsAnotherFrame, setTargetsAnotherFrame] = useState(false)

  useEffect(() => {
    return client.on('highlight-elements', ({ data }) => {
      setLocator(data.locator)
      setTargetsAnotherFrame((data.frames?.length ?? 0) > 0)
    })
  }, [client])

  if (targetsAnotherFrame) {
    return null
  }

  return <ElementHighlights root={document.body} target={locator} />
}
