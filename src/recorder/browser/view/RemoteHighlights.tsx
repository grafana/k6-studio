import { useEffect, useState } from 'react'

import { ElementHighlights } from '@/components/Browser/ElementHighlights'
import { ElementLocator, LocatorOptions } from '@/schemas/locator'

import { useStudioClient } from './StudioClientProvider'

/**
 * Highlights elements when hovering over selectors inside k6 Studio.
 */
export function RemoteHighlights() {
  const client = useStudioClient()

  const [locator, setLocator] = useState<ElementLocator | null>(null)
  const [frames, setFrames] = useState<LocatorOptions[] | undefined>(undefined)

  useEffect(() => {
    return client.on('highlight-elements', ({ data }) => {
      setLocator(data.locator)
      setFrames(data.frames)
    })
  }, [client])

  return (
    <ElementHighlights root={document.body} target={locator} frames={frames} />
  )
}
