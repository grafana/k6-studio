import { BrowserEvent } from '@/schemas/recording/browser'
import { useEffect, useState } from 'react'

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
