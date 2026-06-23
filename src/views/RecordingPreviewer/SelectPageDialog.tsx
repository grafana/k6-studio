import { css, keyframes } from '@emotion/react'
import * as Accordion from '@radix-ui/react-accordion'
import { Button, Dialog, Flex, Text } from '@radix-ui/themes'
import { ChevronDownIcon } from 'lucide-react'

import { BrowserEventList } from '@/components/BrowserEventList'
import { EventPage } from '@/utils/browserEvents'

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

const noop = () => {}

interface SelectPageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pages: EventPage[]
  onSelectPage: (page: EventPage) => void
}

export function SelectPageDialog({
  open,
  onOpenChange,
  pages,
  onSelectPage,
}: SelectPageDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content width="600px" size="3">
        <Dialog.Title>Select a page</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          This recording spans multiple pages. Pick the page you want to create
          a browser test from.
        </Dialog.Description>

        <Accordion.Root type="single" collapsible defaultValue={pages[0]?.tab}>
          {pages.map((page) => (
            <Accordion.Item key={page.tab} value={page.tab}>
              <Flex align="center" gap="2" py="2">
                <Accordion.Header
                  css={{ margin: 0, flex: '1 1 0', minWidth: 0 }}
                >
                  <Accordion.Trigger
                    css={css`
                      display: flex;
                      align-items: center;
                      gap: var(--studio-spacing-2);
                      width: 100%;
                      padding: 0;
                      border: none;
                      background: transparent;
                      cursor: pointer;
                      font: inherit;
                      color: var(--studio-foreground);
                      text-align: left;

                      &:hover {
                        color: var(--studio-accent-11);
                      }

                      .lucide-chevron-down {
                        transition: transform 0.2s ease;
                      }

                      &[data-state='open'] .lucide-chevron-down {
                        transform: rotate(180deg);
                      }
                    `}
                  >
                    <ChevronDownIcon
                      aria-hidden
                      width={14}
                      height={14}
                      css={{ flexShrink: 0, color: 'var(--gray-9)' }}
                    />
                    <Text
                      size="2"
                      truncate
                      css={{ flex: '1 1 0', minWidth: 0 }}
                    >
                      {page.label}
                    </Text>
                  </Accordion.Trigger>
                </Accordion.Header>
                <Button
                  size="2"
                  variant="outline"
                  onClick={() => onSelectPage(page)}
                >
                  Use this page
                </Button>
              </Flex>
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
                <BrowserEventList
                  events={page.events}
                  onNavigate={noop}
                  onHighlight={noop}
                />
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>

        <Flex justify="end" mt="4">
          <Dialog.Close>
            <Button variant="outline" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
