import { css } from '@emotion/react'
import { Code, Flex, Grid, IconButton, Tooltip } from '@radix-ui/themes'
import {
  CircleQuestionMarkIcon,
  GlobeIcon,
  RefreshCwIcon,
  TimerIcon,
  Trash2Icon,
} from 'lucide-react'

import { LocatorWaitForAction, PageGotoAction } from '@/main/runner/schema'
import { exhaustive } from '@/utils/typescript'

import { LocatorInput } from './Inputs/LocatorInput/LocatorInput'
import { UrlInput } from './Inputs/UrlInput/UrlInput'
import { BrowserActionInstance, WithEditorMetadata } from './types'

interface EditableActionProps {
  action: BrowserActionInstance
  onRemove: (actionId: string) => void
  onUpdate: (action: BrowserActionInstance) => void
}

export function EditableAction({
  action,
  onRemove,
  onUpdate,
}: EditableActionProps) {
  const handleRemove = () => {
    onRemove(action.id)
  }

  return (
    <Flex
      align="center"
      p="2"
      gap="2"
      css={css`
        font-size: var(--font-size-1);

        & + & {
          border-top: 1px solid var(--studio-border-color);
        }
      `}
    >
      <ActionIcon method={action.method} />
      <ActionBody action={action} onUpdate={onUpdate} />
      <Tooltip content="Remove action">
        <IconButton
          size="2"
          variant="ghost"
          color="gray"
          onClick={handleRemove}
          aria-label="Remove action"
          css={{ marginLeft: 'auto' }}
        >
          <Trash2Icon />
        </IconButton>
      </Tooltip>
    </Flex>
  )
}

interface ActionIconProps {
  method: BrowserActionInstance['method']
}

function ActionIcon({ method }: ActionIconProps) {
  switch (method) {
    case 'page.goto':
      return <GlobeIcon aria-hidden="true" />
    case 'page.reload':
      return <RefreshCwIcon aria-hidden="true" />
    case 'locator.waitFor':
      return <TimerIcon aria-hidden="true" />
    case 'page.waitForNavigation':
    case 'page.close':
    case 'page.*':
    case 'locator.click':
    case 'locator.dblclick':
    case 'locator.fill':
    case 'locator.type':
    case 'locator.check':
    case 'locator.uncheck':
    case 'locator.selectOption':
    case 'locator.hover':
    case 'locator.setChecked':
    case 'locator.tap':
    case 'locator.clear':
    case 'locator.press':
    case 'locator.focus':
    case 'locator.*':
    case 'browserContext.*':
      return <CircleQuestionMarkIcon aria-hidden="true" />
    default:
      return exhaustive(method)
  }
}

interface ActionBodyProps {
  action: BrowserActionInstance
  onUpdate: (action: BrowserActionInstance) => void
}

function ActionBody({ action, onUpdate }: ActionBodyProps) {
  switch (action.method) {
    case 'page.goto':
      return <GoToActionBody action={action} onUpdate={onUpdate} />
    case 'page.reload':
      return <RefreshActionBody />
    case 'locator.waitFor':
      return <WaitForActionBody action={action} onUpdate={onUpdate} />
    case 'page.waitForNavigation':
    case 'page.close':
    case 'page.*':
    case 'locator.click':
    case 'locator.dblclick':
    case 'locator.fill':
    case 'locator.type':
    case 'locator.check':
    case 'locator.uncheck':
    case 'locator.selectOption':
    case 'locator.hover':
    case 'locator.setChecked':
    case 'locator.tap':
    case 'locator.clear':
    case 'locator.press':
    case 'locator.focus':
    case 'locator.*':
    case 'browserContext.*':
      return (
        <>
          <Code>{action.method}</Code> not implemented
        </>
      )
    default:
      exhaustive(action)
  }
}

interface GoToActionBodyProps {
  action: WithEditorMetadata<PageGotoAction>
  onUpdate: (action: WithEditorMetadata<PageGotoAction>) => void
}

function GoToActionBody({ action, onUpdate }: GoToActionBodyProps) {
  const handleChangeUrl = (url: string) => {
    onUpdate({
      ...action,
      url,
    })
  }

  return (
    <Grid columns="max-content auto" gap="2" align="center">
      Navigate to <UrlInput value={action.url} onChange={handleChangeUrl} />
    </Grid>
  )
}

interface WaitForActionBodyProps {
  action: WithEditorMetadata<LocatorWaitForAction>
  onUpdate: (action: WithEditorMetadata<LocatorWaitForAction>) => void
}

function WaitForActionBody({ action, onUpdate }: WaitForActionBodyProps) {
  const handleChangeLocator = (
    locator: WithEditorMetadata<LocatorWaitForAction>['locator']
  ) => {
    onUpdate({
      ...action,
      locator,
    })
  }

  return (
    <Grid columns="max-content auto" gap="2" align="center">
      Wait for element
      <LocatorInput state={action.locator} onChange={handleChangeLocator} />
    </Grid>
  )
}

function RefreshActionBody() {
  return <>Reload page</>
}
