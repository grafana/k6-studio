import { useEffect, useState } from 'react'

import { BrowserEvent } from '@/schemas/recording'

import { useStudioClient } from './StudioClientProvider'

export function useRecordedEvents() {
  const client = useStudioClient()

  const [events, setEvents] = useState<BrowserEvent[]>([])

  useEffect(() => {
    return client.on('events-recorded', (event) => {
      setEvents((prev) => [...prev, ...event.data.events])
    })
  }, [client])

  useEffect(() => {
    return client.on('events-loaded', (event) => {
      setEvents(event.data.events)
    })
  }, [client])

  useEffect(() => {
    client.send({
      type: 'load-events',
    })
  }, [client])

  useEffect(() => {
    // We reload the list of events whenever the page is shown from the
    // back/forward cache to make sure we have the latest state.
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        client.send({
          type: 'load-events',
        })
      }
    }

    window.addEventListener('pageshow', handlePageShow)

    return () => {
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [client])

  return events
}
