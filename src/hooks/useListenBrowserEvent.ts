import { useEffect, useState } from 'react'

import { BrowserEvent } from '@/schemas/recording'

export function useListenBrowserEvent() {
  const [events, setEvents] = useState<BrowserEvent[]>([])

  useEffect(() => {
    return window.studio.browser.onBrowserEvent((events: BrowserEvent[]) => {
      console.log('Received browser events', events)

      setEvents((prevEvents) => [...prevEvents, ...events])
    })
  }, [])

  return events
}
