import { css } from '@emotion/react'
import {
  Badge,
  Popover,
  Code,
  Flex,
  IconButton,
  TextField,
  Tooltip,
  Button,
  Text,
} from '@radix-ui/themes'
import {
  CircleQuestionMarkIcon,
  GlobeIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { AnyBrowserAction, PageGotoAction } from '@/main/runner/schema'
import { exhaustive } from '@/utils/typescript'

import { BrowserActionWithId } from './types'

interface EditableActionProps {
  action: BrowserActionWithId
  onRemove: (actionId: string) => void
  onUpdate: (action: BrowserActionWithId) => void
}

export function EditableAction({
  action: { id: actionId, action },
  onRemove,
  onUpdate,
}: EditableActionProps) {
  const handleRemove = () => {
    onRemove(actionId)
  }

  const handleUpdate = (updatedAction: AnyBrowserAction) => {
    onUpdate({
      id: actionId,
      action: updatedAction,
    })
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
      <ActionIcon action={action} />{' '}
      <ActionBody action={action} onUpdate={handleUpdate} />
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
  action: AnyBrowserAction
}

function ActionIcon({ action }: ActionIconProps) {
  switch (action.method) {
    case 'page.goto':
      return <GlobeIcon aria-hidden="true" />
    case 'page.reload':
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
    case 'locator.waitFor':
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
      return exhaustive(action)
  }
}

interface ActionBodyProps {
  action: AnyBrowserAction
  onUpdate: (action: AnyBrowserAction) => void
}

function ActionBody({ action, onUpdate }: ActionBodyProps) {
  switch (action.method) {
    case 'page.goto':
      return <GoToActionBody action={action} onUpdate={onUpdate} />
    case 'page.reload':
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
    case 'locator.waitFor':
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
  action: PageGotoAction
  onUpdate: (action: PageGotoAction) => void
}

function GoToActionBody({ action, onUpdate }: GoToActionBodyProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [url, setUrl] = useState(action.url)

  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate({
      ...action,
      url,
    })
    setIsPopoverOpen(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
  }

  useEffect(() => {
    try {
      new URL(url)
      setError(null)
    } catch {
      setError('Invalid URL')
    }
  }, [url])

  useEffect(() => {
    setUrl(action.url)
  }, [action.url])

  return (
    <>
      Navigate to{' '}
      <Popover.Root open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <Popover.Trigger>
          <Badge color={error ? 'red' : 'gray'} asChild>
            <Button size="1">
              {action.url}
              {error && (
                <Tooltip content={error}>
                  <TriangleAlertIcon />
                </Tooltip>
              )}
            </Button>
          </Badge>
        </Popover.Trigger>
        <Popover.Content align="start" size="1" width="300px">
          <form onSubmit={handleSubmit}>
            <TextField.Root
              size="1"
              color={error ? 'red' : 'gray'}
              value={url}
              onChange={handleChange}
              onBlur={handleSubmit}
              placeholder="e.g. https://quickpizza.grafana.com"
            />
            {error && (
              <Text size="1" color="red" mt="1">
                {error}
              </Text>
            )}
          </form>
        </Popover.Content>
      </Popover.Root>
    </>
  )
}
