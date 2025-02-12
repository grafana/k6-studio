import {
  BrowserEvent,
  ClickEvent,
  PageNavigationEvent,
} from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'
import { css } from '@emotion/react'
import {
  CheckCircledIcon,
  CircleIcon,
  DropdownMenuIcon,
  GlobeIcon,
  InputIcon,
  RadiobuttonIcon,
  TargetIcon,
  UpdateIcon,
} from '@radix-ui/react-icons'
import { Flex, Table, Tooltip, Kbd, Button } from '@radix-ui/themes'
import { Fragment, useState } from 'react'
import { ExportScriptDialog } from '../Generator/ExportScriptDialog'

function formatOptions(options: string[]) {
  if (options.length === 1) {
    return <code>{options[0]}</code>
  }

  const last = options[options.length - 1]

  if (last === undefined) {
    return ''
  }

  return (
    <>
      {options.slice(0, -1).map((option, index) => {
        return (
          <Fragment key={index}>
            <code>{option}</code>,{' '}
          </Fragment>
        )
      })}{' '}
      and <code>{last}</code>
    </>
  )
}

interface SelectorProps {
  children: string
}

function Selector({ children }: SelectorProps) {
  return <strong>{children}</strong>
}

function getModifierKeys(modifiers: ClickEvent['modifiers']) {
  const keys = []
  const platform = window.studio.app.platform

  if (modifiers.ctrl) {
    keys.push('⌃ Ctrl')
  }

  if (modifiers.shift) {
    keys.push('⇧ Shift')
  }

  if (modifiers.alt) {
    keys.push(platform === 'darwin' ? '⌥ Option' : '⌥ Alt')
  }

  if (modifiers.meta) {
    keys.push(platform === 'darwin' ? '⌘ Command' : '⊞ Meta')
  }

  return keys
}

interface EventIconProps {
  event: BrowserEvent
}

function EventIcon({ event }: EventIconProps) {
  switch (event.type) {
    case 'page-navigation':
      return <GlobeIcon />

    case 'page-reload':
      return <UpdateIcon />

    case 'click':
      return <TargetIcon />

    case 'input-change':
      return <InputIcon />

    case 'check':
      return event.checked ? <CheckCircledIcon /> : <CircleIcon />

    case 'switch':
      return <RadiobuttonIcon />

    case 'select':
      return <DropdownMenuIcon />

    default:
      return exhaustive(event)
  }
}

interface PageNavigationDescriptionProps {
  event: PageNavigationEvent
}

function PageNavigationDescription({ event }: PageNavigationDescriptionProps) {
  const url = (
    <Tooltip content={event.url}>
      <strong>{event.url}</strong>
    </Tooltip>
  )

  switch (event.source) {
    case 'interaction':
      return <>Navigated to {url} by interacting with the page.</>

    case 'script':
      return <>Navigated to {url} by a script.</>

    case 'address-bar':
      return <>Navigated to {url} using the address bar.</>

    case 'history':
      return <>Navigated to {url} using the browser history.</>

    default:
      return exhaustive(event.source)
  }
}

function getButtonDescription(event: ClickEvent) {
  switch (event.button) {
    case 'left':
      return 'Clicked'

    case 'middle':
      return 'Middle-clicked'

    case 'right':
      return 'Right-clicked'

    default:
      return exhaustive(event.button)
  }
}

interface ClickDescriptionProps {
  event: ClickEvent
}

function ClickDescription({ event }: ClickDescriptionProps) {
  const modifiers = getModifierKeys(event.modifiers)
  const button = getButtonDescription(event)

  const clickedText = modifiers.concat(button).join(' + ')

  return (
    <>
      <Kbd size="2">{clickedText}</Kbd> on element{' '}
      <strong>{event.selector}</strong>
    </>
  )
}

interface EventDescriptionProps {
  event: BrowserEvent
}

function EventDescription({ event }: EventDescriptionProps) {
  switch (event.type) {
    case 'page-navigation':
      return <PageNavigationDescription event={event} />

    case 'page-reload':
      return <>Reloaded page.</>

    case 'click':
      return <ClickDescription event={event} />

    case 'input-change':
      return (
        <>
          Changed input of <Selector>{event.selector}</Selector> to{' '}
          <code>{event.value}</code>.
        </>
      )

    case 'check':
      return (
        <>
          {event.checked ? 'Checked' : 'Unchecked'} checkbox{' '}
          <Selector>{event.selector}</Selector>.
        </>
      )

    case 'switch':
      return (
        <>
          Switched value of <strong>{event.name}</strong> to{' '}
          <code>{event.value}</code> from <Selector>{event.selector}</Selector>.
        </>
      )

    case 'select':
      return (
        <>
          Selected {formatOptions(event.selected)} from{' '}
          <Selector>{event.selector}</Selector>.
        </>
      )

    default:
      return exhaustive(event)
  }
}

interface BrowserEventLogProps {
  events: BrowserEvent[]
  onExportScript?: (fileName: string) => void
}

export function BrowserEventLog({
  events,
  onExportScript,
}: BrowserEventLogProps) {
  const [showExportDialog, setShowExportDialog] = useState(false)

  function handleExportScriptClick() {
    setShowExportDialog(true)
  }

  return (
    <Flex direction="column" minHeight="0" height="100%">
      {onExportScript && (
        <Flex justify="end" align="center" p="1" pr="2">
          <Flex gap="2" align="center">
            <Button
              size="2"
              variant="outline"
              onClick={handleExportScriptClick}
            >
              Export script
            </Button>
          </Flex>
        </Flex>
      )}

      <Table.Root
        layout="fixed"
        css={css`
          border-top: 1px solid var(--gray-6);
          height: 100%;
        `}
      >
        <Table.Body>
          {events.map((event) => {
            return (
              <Table.Row key={event.eventId}>
                <Table.Cell>
                  <Flex align="center" gap="2">
                    <EventIcon event={event} />
                    <div
                      css={css`
                        flex: 1 1 0;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                      `}
                    >
                      <EventDescription event={event} />
                    </div>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>
      {onExportScript && (
        <ExportScriptDialog
          open={showExportDialog}
          initialScriptName="my-browser-script.js"
          onOpenChange={setShowExportDialog}
          onExport={onExportScript}
        />
      )}
    </Flex>
  )
}
