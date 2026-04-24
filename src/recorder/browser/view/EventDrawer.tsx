import { css, keyframes } from '@emotion/react'
import * as Dialog from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'

import { BrowserEventList } from '@/components/BrowserEventList'
import { useContainerElement } from '@/components/primitives/ContainerProvider'
import { ActionLocator } from '@/schemas/locator'
import { BrowserEvent } from '@/schemas/recording'
import { RecordingContext } from '@/views/Recorder/RecordingContext'

import { RecorderSettings } from './RecorderSettings'
import { useInBrowserSettings } from './SettingsProvider'
import { useStudioClient } from './StudioClientProvider'
import { ToolBoxLogo } from './ToolBox/ToolBoxLogo'

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
  events: BrowserEvent[]
  onOpenChange: (open: boolean) => void
}

export function EventDrawer({ open, events, onOpenChange }: EventDrawerProps) {
  const client = useStudioClient()
  const container = useContainerElement()
  const [settings, setSettings] = useInBrowserSettings()

  const handleHighlight = (selector: ActionLocator | null) => {
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
        <Dialog.Portal container={container}>
          <Dialog.Overlay
            css={css`
              position: fixed;
              inset: 0;
              z-index: var(--studio-layer-0);
              background: rgb(0 0 0 / 0.28);
              opacity: 0;
              pointer-events: none;
              transition: opacity 0.2s ease-out;

              &[data-state='open'] {
                opacity: 1;
                pointer-events: auto;
              }

              @media (prefers-reduced-motion: reduce) {
                transition: none;
              }
            `}
            onPointerDown={() => {
              onOpenChange(false)
            }}
          />
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
              overflow-x: auto;
              overflow-y: hidden;
              overscroll-behavior: contain;

              &[data-state='open'] {
                animation: ${slideIn} 0.3s cubic-bezier(0.22, 1, 0.36, 1);
              }

              &[data-state='closed'] {
                animation: ${slideOut} 0.3s cubic-bezier(0.22, 1, 0.36, 1);
              }

              @media (prefers-reduced-motion: reduce) {
                transition: none;
              }
            `}
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
              <h2
                css={css`
                  margin: 0 0 var(--studio-spacing-3);
                  font-size: var(--studio-font-size-3);
                  font-weight: 700;
                `}
              >
                Settings
              </h2>
              <RecorderSettings
                settings={settings}
                onSettingsChange={setSettings}
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </RecordingContext>
  )
}
