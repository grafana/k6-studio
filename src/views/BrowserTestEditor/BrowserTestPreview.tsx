import { css } from '@emotion/react'
import { Flex, IconButton, Popover, Text } from '@radix-ui/themes'
import { Settings2Icon } from 'lucide-react'

import LogoGradient from '@/assets/logo-gradient.svg'
import { useHighlightedLocator } from '@/components/HighlightLocatorProvider'
import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'
import { PersistentTabs } from '@/components/primitives/PersistentTabs'
import { SessionPlayer } from '@/components/SessionPlayer/SessionPlayer'
import { PlayerMouseEvent } from '@/components/SessionPlayer/SessionPlayer.hooks'
import { AnyBrowserAction } from '@/schemas/browserTest'
import { DebugSession } from '@/views/Validator/types'

import { ReplayContextMenu } from './ReplayContextMenu'
import { createContextMenuState } from './ReplayContextMenu.utils'
import { ShutdownDelayControl } from './ShutdownDelayControl'
import { ContextMenuState } from './types'

interface BrowserTestPreviewProps {
  state: ContextMenuState | null
  session: DebugSession
  previewScript: string
  shutdownDelay: number
  onStateChange: (state: ContextMenuState | null) => void
  onAddAction: (action: AnyBrowserAction) => void
  onShutdownDelayChange: (timeout: number) => void
}

export function BrowserTestPreview({
  state,
  session,
  previewScript,
  shutdownDelay,
  onStateChange,
  onAddAction,
  onShutdownDelayChange,
}: BrowserTestPreviewProps) {
  const highlightedLocator = useHighlightedLocator()

  const handleClick = (event: PlayerMouseEvent) => {
    if (state !== null) {
      onStateChange(null)

      return
    }

    onStateChange(createContextMenuState(event))
  }

  return (
    <PersistentTabs.Root asChild defaultValue="preview">
      <Flex direction="column" height="100%" width="100%">
        <PersistentTabs.List>
          <PersistentTabs.Trigger value="preview">
            Preview
          </PersistentTabs.Trigger>
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
            interactive
            initialPage={{
              title: 'k6 Studio',
              pageId: '',
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
            highlightedElement={
              state?.type === 'context-menu' ? state.target : highlightedLocator
            }
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
            onClick={handleClick}
          />
          {state !== null && (
            <ReplayContextMenu
              key={state.key}
              target={state.target}
              position={state.position}
              aria={state.aria}
              locator={state.locator}
              onClose={() => onStateChange(null)}
              onAddAction={onAddAction}
            />
          )}
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
