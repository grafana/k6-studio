import { useEffect, useState } from 'react'

import { ElementHighlights } from '@/components/Browser/ElementHighlights'
import { NodeSelector } from '@/schemas/selectors'

import { useStudioClient } from './StudioClientProvider'

/**
 * Highlights elements when hovering over selectors inside k6 Studio.
 */
export function RemoteHighlights() {
  const client = useStudioClient()

  const [selector, setSelector] = useState<NodeSelector | null>(null)

  useEffect(() => {
    return client.on('highlight-elements', ({ data }) => {
      setSelector(data.selector)
    })
  }, [client])

  return <ElementHighlights element={document.body} selector={selector} />
}
