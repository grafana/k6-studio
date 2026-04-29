import { useEffect, useState } from 'react'

import { ElementHighlights } from '@/components/Browser/ElementHighlights'
import { ElementLocator } from '@/schemas/locator'

import { useStudioClient } from './StudioClientProvider'

/**
 * Highlights elements when hovering over selectors inside k6 Studio.
 */
export function RemoteHighlights() {
  const client = useStudioClient()

  const [locator, setLocator] = useState<ElementLocator | null>(null)

  useEffect(() => {
    return client.on('highlight-elements', ({ data }) => {
      setLocator(data.locator)
    })
  }, [client])

  return <ElementHighlights element={document.body} locator={locator} />
}
