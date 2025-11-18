import { css } from '@emotion/react'
import * as Dialog from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { BrowserEventList } from '@/components/BrowserEventList'
import { useContainerElement } from '@/components/primitives/ContainerProvider'
import { BrowserEvent } from '@/schemas/recording'
import { RecordingContext } from '@/views/Recorder/RecordingContext'
import { HighlightSelector } from 'extension/src/messaging/types'

import { useStudioClient } from './StudioClientProvider'

function useRecordedEvents() {
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

interface EventDrawerProps {
  open: boolean
  editing: boolean
  onOpenChange: (open: boolean) => void
}

export function EventDrawer({ open, editing, onOpenChange }: EventDrawerProps) {
  const client = useStudioClient()
  const container = useContainerElement()

  const events = useRecordedEvents()

  const handleHighlight = (selector: HighlightSelector | null) => {
    client.send({
      type: 'highlight-elements',
      selector,
    })
  }

  const handleNavigate = (url: string) => {
    client.send({
      type: 'navigate',
      url,
    })
  }

  return (
    <RecordingContext recording>
      <Dialog.Root modal={false} open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal container={container} forceMount>
          <Dialog.Overlay />
          <Dialog.Content
            forceMount
            css={css`
              position: fixed;
              top: 0;
              right: 0;
              bottom: 0;
              z-index: var(--studio-layer-1);

              width: 35vw;
              min-width: 300px;
              max-width: 600px;
              background-color: var(--studio-background);
              box-shadow: var(--studio-shadow-1);

              display: flex;
              flex-direction: column;
              overflow-x: auto;
              overflow-y: hidden;
              overscroll-behavior: contain;

              /* Default closed state */
              transform: translateX(100%);
              transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);

              &[data-state='open'] {
                transform: translateX(0);
              }

              &[data-state='closed'] {
                transform: translateX(100%);
              }

              @media (prefers-reduced-motion: reduce) {
                transition: none;
              }
            `}
            onEscapeKeyDown={(event) => {
              // If the user is currently editing something, the escape key should deselect
              // the tool and not close the drawer.
              if (editing) {
                event.preventDefault()
              }
            }}
            onInteractOutside={(event) => {
              event.preventDefault()
            }}
          >
            <div
              css={css`
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--studio-spacing-4);
                position: sticky;
                top: 0;
                background-color: inherit;
                z-index: var(--studio-layer-1);
              `}
            >
              <Dialog.Title
                css={css`
                  margin: 0;
                `}
              >
                Events
              </Dialog.Title>
              <Dialog.Close
                aria-label="Close event list"
                css={css`
                  background-color: transparent;
                  color: var(--studio-foreground);
                  border: none;
                  padding: 0;
                  cursor: pointer;
                  padding: var(--studio-spacing-2);
                  border-radius: 50%;

                  display: flex;
                  align-items: center;
                  justify-content: center;

                  &:hover {
                    background-color: var(--studio-hover-color);
                  }
                `}
              >
                <XIcon />
              </Dialog.Close>
            </div>
            <div
              css={css`
                padding: 0 var(--studio-spacing-4);
                overflow-x: auto;
                overscroll-behavior: contain;
                flex: 1 1 0;
              `}
            >
              <BrowserEventList
                events={events}
                onNavigate={handleNavigate}
                onHighlight={handleHighlight}
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </RecordingContext>
  )
}
