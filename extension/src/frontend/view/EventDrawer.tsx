import { css, keyframes } from '@emotion/react'
import * as Accordion from '@radix-ui/react-accordion'
import * as Dialog from '@radix-ui/react-dialog'
import { ChevronDownIcon, XIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { BrowserEventList } from '@/components/BrowserEventList'
import { useContainerElement } from '@/components/primitives/ContainerProvider'
import { Flex } from '@/components/primitives/Flex'
import { RadioGroup } from '@/components/primitives/RadioGroup'
import { Text } from '@/components/primitives/Text'
import { BrowserEvent } from '@/schemas/recording'
import { RecordingContext } from '@/views/Recorder/RecordingContext'
import { HighlightSelector } from 'extension/src/messaging/types'

import { eventManager } from '../manager'

import { useInBrowserSettings } from './SettingsProvider'
import { useStudioClient } from './StudioClientProvider'
import { ToolBoxLogo } from './ToolBox/ToolBoxLogo'

const accordionSlideDown = keyframes`
  from {
    height: 0;
  }
  to {
    height: var(--radix-accordion-content-height);
  }
`

const accordionSlideUp = keyframes`
  from {
    height: var(--radix-accordion-content-height);
  }
  to {
    height: 0;
  }
`

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

interface SectionHeadingProps {
  className?: string
  children: React.ReactNode
}

function SectionHeading({ className, children }: SectionHeadingProps) {
  return (
    <h2
      className={className}
      css={css`
        margin: 0 0 var(--studio-spacing-3);
        font-size: var(--studio-font-size-3);
        font-weight: 700;
      `}
    >
      {children}
    </h2>
  )
}

interface EventDrawerProps {
  open: boolean
  editing: boolean
  onOpenChange: (open: boolean) => void
}

export function EventDrawer({ open, editing, onOpenChange }: EventDrawerProps) {
  const client = useStudioClient()
  const container = useContainerElement()
  const [settings, setSettings] = useInBrowserSettings()

  const events = useRecordedEvents()

  const handleClickRecordingModeChange = (value: string) => {
    if (value === 'interactive-only' || value === 'any') {
      setSettings({ clickRecordingMode: value })
    }
  }

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
      <Dialog.Root modal={true} open={open} onOpenChange={onOpenChange}>
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
            onPointerDownOutside={(ev) => {
              eventManager.block('click', ev.target)
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
                  display: flex;
                  align-items: center;
                  gap: var(--studio-spacing-2);
                `}
              >
                <ToolBoxLogo size={24} />
                <span>k6 Studio</span>
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
                display: flex;
                flex-direction: column;
                flex: 1 1 0;
              `}
            >
              <SectionHeading
                css={css`
                  padding: 0 var(--studio-spacing-4);
                `}
              >
                Events ({events.length})
              </SectionHeading>
              <div
                css={css`
                  overflow-x: auto;
                  overflow-y: auto;
                  overscroll-behavior: contain;
                  flex: 1 1 0;
                  min-height: 0;
                `}
              >
                <BrowserEventList
                  events={events}
                  onNavigate={handleNavigate}
                  onHighlight={handleHighlight}
                />
              </div>
            </div>
            <div
              css={css`
                flex-shrink: 0;
                border-top: 1px solid var(--studio-border-color);
                padding: var(--studio-spacing-4);
                background-color: inherit;
              `}
            >
              <SectionHeading>Settings</SectionHeading>
              <Accordion.Root type="single" collapsible>
                <Accordion.Item value="click-options">
                  <Accordion.Header
                    css={css`
                      margin: 0;
                    `}
                  >
                    <Accordion.Trigger
                      css={css`
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: var(--studio-spacing-2);
                        width: 100%;
                        padding: 0;
                        border: none;
                        background: transparent;
                        cursor: pointer;
                        font: inherit;
                        font-size: var(--studio-font-size-2);
                        font-weight: 500;
                        color: var(--studio-foreground);
                        text-align: left;

                        &:hover {
                          color: var(--studio-accent-11);
                        }

                        &[data-state='open'] svg {
                          transform: rotate(180deg);
                        }

                        @media (prefers-reduced-motion: reduce) {
                          &[data-state='open'] svg {
                            transform: none;
                          }
                        }
                      `}
                    >
                      Click event options
                      <ChevronDownIcon
                        aria-hidden
                        width={16}
                        height={16}
                        css={css`
                          flex-shrink: 0;
                          transition: transform 0.2s ease;

                          @media (prefers-reduced-motion: reduce) {
                            transition: none;
                          }
                        `}
                      />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content
                    css={css`
                      overflow: hidden;

                      &[data-state='open'] {
                        animation: ${accordionSlideDown} 0.2s ease-out;
                      }

                      &[data-state='closed'] {
                        animation: ${accordionSlideUp} 0.2s ease-out;
                      }

                      @media (prefers-reduced-motion: reduce) {
                        animation: none;
                      }
                    `}
                  >
                    <div
                      css={css`
                        padding-top: var(--studio-spacing-3);
                      `}
                    >
                      <RadioGroup.Root
                        value={settings.clickRecordingMode}
                        onValueChange={handleClickRecordingModeChange}
                        aria-label="Click event options"
                      >
                        <Flex direction="column" gap="3" align="stretch">
                          <label
                            css={css`
                              display: flex;
                              gap: var(--studio-spacing-2);
                              align-items: flex-start;
                              cursor: pointer;
                            `}
                          >
                            <RadioGroup.Item
                              value="interactive-only"
                              css={css`
                                flex-shrink: 0;
                                margin-top: 2px;
                              `}
                            />
                            <Flex direction="column" gap="1" align="start">
                              <Text weight="medium">Interactive only</Text>
                              <Text size="1" weight="light">
                                Only records clicks on interactive controls such
                                as buttons and links. Clicks on non-interactive
                                areas are ignored.
                              </Text>
                            </Flex>
                          </label>
                          <label
                            css={css`
                              display: flex;
                              gap: var(--studio-spacing-2);
                              align-items: flex-start;
                              cursor: pointer;
                            `}
                          >
                            <RadioGroup.Item
                              value="any"
                              css={css`
                                flex-shrink: 0;
                                margin-top: 2px;
                              `}
                            />
                            <Flex direction="column" gap="1" align="start">
                              <Text weight="medium">Any element</Text>
                              <Text size="1" weight="light">
                                Records all clicks. When the click is inside a
                                control, the recording uses that control;
                                otherwise the exact target is used.
                              </Text>
                            </Flex>
                          </label>
                        </Flex>
                      </RadioGroup.Root>
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              </Accordion.Root>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </RecordingContext>
  )
}
