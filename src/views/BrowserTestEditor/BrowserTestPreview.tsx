import { css } from '@emotion/react'
import { Flex, IconButton, Popover, Text } from '@radix-ui/themes'
import { Settings2Icon } from 'lucide-react'

import LogoGradient from '@/assets/logo-gradient.svg'
import { useHighlightedLocator } from '@/components/HighlightLocatorProvider'
import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'
import { SessionPlayer } from '@/components/SessionPlayer/SessionPlayer'
import { PersistentTabs } from '@/components/primitives/PersistentTabs'
import { DebugSession } from '@/views/Validator/types'

import { ShutdownDelayControl } from './ShutdownDelayControl'

interface BrowserTestPreviewProps {
  session: DebugSession
  previewScript: string
  shutdownDelay: number
  onShutdownDelayChange: (timeout: number) => void
}

export function BrowserTestPreview({
  session,
  previewScript,
  shutdownDelay,
  onShutdownDelayChange,
}: BrowserTestPreviewProps) {
  const highlightedLocator = useHighlightedLocator()

  return (
    <PersistentTabs.Root asChild defaultValue="preview">
      <Flex direction="column" height="100%" width="100%">
        <PersistentTabs.List>
          <PersistentTabs.Trigger value="preview">Preview</PersistentTabs.Trigger>
          <PersistentTabs.Trigger value="script">Script</PersistentTabs.Trigger>
        </PersistentTabs.List>
        <PersistentTabs.Content
          css={css`
            flex: 1 1 0;
            overflow: hidden;
          `}
          value="preview"
        >
          <SessionPlayer
            key={session.id}
            initialPage={{
              title: 'k6 Studio',
              href: '',
              width: 1280,
              height: 720,
            }}
            placeholder="Waiting for the initial URL..."
            initialContent={
              <Flex align="center" justify="center" direction="column" gap="2">
                <img
                  src={LogoGradient}
                  alt="k6 Studio"
                  css={css`
                    width: 64px;
                    height: 64px;
                  `}
                />
                <Text size="2" color="gray">
                  Run the test to see a preview...
                </Text>
              </Flex>
            }
            session={session}
            highlightedLocator={highlightedLocator}
            controls={
              <Popover.Root>
                <Popover.Trigger>
                  <IconButton
                    variant="ghost"
                    size="1"
                    color="gray"
                    aria-label="Test settings"
                  >
                    <Settings2Icon size={14} />
                  </IconButton>
                </Popover.Trigger>
                <Popover.Content size="1" align="end" side="top">
                  <ShutdownDelayControl
                    timeout={shutdownDelay}
                    onChange={onShutdownDelayChange}
                  />
                </Popover.Content>
              </Popover.Root>
            }
          />
        </PersistentTabs.Content>
        <PersistentTabs.Content
          css={css`
            flex: 1 1 0;
            overflow: hidden;
          `}
          value="script"
        >
          <ReadOnlyEditor
            value={previewScript}
            showToolbar={false}
            language="typescript"
          />
        </PersistentTabs.Content>
      </Flex>
    </PersistentTabs.Root>
  )
}
