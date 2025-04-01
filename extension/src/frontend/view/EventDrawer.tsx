import { css, keyframes } from '@emotion/react'
import * as Dialog from '@radix-ui/react-dialog'
import { Cross1Icon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'

import { BrowserEventList } from '@/components/BrowserEventList'
import { useContainerElement } from '@/components/primitives/ContainerProvider'
import { BrowserEvent } from '@/schemas/recording'
import { RecordingContext } from '@/views/Recorder/RecordingContext'

import { client } from '../routing'

function useRecordedEvents() {
  const [events, setEvents] = useState<BrowserEvent[]>([])

  useEffect(() => {
    return client.on('events-recorded', (event) => {
      setEvents((prev) => [...prev, ...event.data.events])
    })
  }, [])

  useEffect(() => {
    return client.on('events-loaded', (event) => {
      setEvents(event.data.events)
    })
  }, [])

  useEffect(() => {
    client.send({
      type: 'load-events',
    })
  }, [])

  return events
}

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    
    }
  to {
      transform: translateX(0);
  }
`

const slideOut = keyframes`
  from {
    transform: translateX(0);
    
    }
  to {
      transform: translateX(100%);
  }
`

interface EventDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventDrawer({ open, onOpenChange }: EventDrawerProps) {
  const container = useContainerElement()

  const events = useRecordedEvents()

  const handleHighlight = (selector: string | null) => {
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
        <Dialog.Portal container={container}>
          <Dialog.Overlay />
          <Dialog.Content
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
              overflow: auto hidden;
              overscroll-behavior: contain;

              &[data-state='open'] {
                animation: ${slideIn} 0.3s cubic-bezier(0.22, 1, 0.36, 1);
              }

              &[data-state='closed'] {
                animation: ${slideOut} 0.3s cubic-bezier(0.22, 1, 0.36, 1);
              }

              @media (prefers-reduced-motion: reduce) {
                animation: none;
              }
            `}
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
                <Cross1Icon />
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
