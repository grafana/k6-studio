import * as Dialog from '@radix-ui/react-dialog'
import { css, keyframes } from '@emotion/react'
import { Cross1Icon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import { BrowserEvent } from '@/schemas/recording'
import { background } from '../client'
import { BrowserEventList } from '@/components/BrowserEventList'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { useContainerElement } from '@/components/primitives/ContainerProvider'

function useRecordedEvents() {
  const [events, setEvents] = useState<BrowserEvent[]>([])

  useEffect(() => {
    return background.on('events-recorded', (event) => {
      setEvents((prev) => [...prev, ...event.data.events])
    })
  }, [])

  useEffect(() => {
    return background.on('events-loaded', (event) => {
      setEvents(event.data.events)
    })
  }, [])

  useEffect(() => {
    background.send({
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

  return (
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
            padding: var(--studio-spacing-4);
            background-color: white;
            box-shadow: var(--studio-shadow-1);

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
              padding-left: var(--studio-spacing-2);
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
                border: none;
                padding: 0;
                cursor: pointer;
                padding: var(--studio-spacing-2);
                border-radius: 50%;

                display: flex;
                align-items: center;
                justify-content: center;

                &:hover {
                  background-color: rgba(0, 0, 0, 0.1);
                }
              `}
            >
              <Cross1Icon />
            </Dialog.Close>
          </div>
          <TooltipProvider>
            <BrowserEventList
              events={events}
              onHighlight={() => {}}
              onNavigate={() => {}}
            />
          </TooltipProvider>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
