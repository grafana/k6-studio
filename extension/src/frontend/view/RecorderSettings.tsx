import { css, keyframes } from '@emotion/react'
import * as Accordion from '@radix-ui/react-accordion'
import { MinusIcon, PlusIcon } from 'lucide-react'

import { Flex } from '@/components/primitives/Flex'
import { RadioGroup } from '@/components/primitives/RadioGroup'
import { Text } from '@/components/primitives/Text'
import { InBrowserSettings } from 'extension/src/messaging/types'

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

export type ClickRecordingMode = NonNullable<
  InBrowserSettings['clickRecordingMode']
>

export interface RecorderSettingsProps {
  settings: InBrowserSettings
  onSettingsChange: (settings: InBrowserSettings) => void
}

export function RecorderSettings({
  settings,
  onSettingsChange,
}: RecorderSettingsProps) {
  const handleValueChange = (value: string) => {
    if (value === 'interactive-only' || value === 'any') {
      onSettingsChange({ ...settings, clickRecordingMode: value })
    }
  }

  return (
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

              svg.lucide-plus {
                display: block;
              }

              svg.lucide-minus {
                display: none;
              }

              &[data-state='open'] {
                .lucide-plus {
                  display: none;
                }

                .lucide-minus {
                  display: block;
                }
              }
            `}
          >
            Click event options
            <PlusIcon aria-hidden width={16} height={16} />
            <MinusIcon aria-hidden width={16} height={16} />
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
              value={settings.clickRecordingMode ?? 'interactive-only'}
              onValueChange={handleValueChange}
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
                      Only records clicks on interactive controls such as
                      buttons and links. Clicks on non-interactive areas are
                      ignored.
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
                      Records all clicks. When the click is inside a control,
                      the recording uses that control; otherwise the exact
                      target is used.
                    </Text>
                  </Flex>
                </label>
              </Flex>
            </RadioGroup.Root>
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  )
}
