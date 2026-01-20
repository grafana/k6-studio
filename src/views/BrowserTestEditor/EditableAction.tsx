import { css } from '@emotion/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Code, Flex, IconButton, TextField, Tooltip } from '@radix-ui/themes'
import {
  CircleQuestionMarkIcon,
  GlobeIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

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
      return <GlobeIcon />
    case 'page.reload':
    case 'page.waitForNavigation':
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
      return <CircleQuestionMarkIcon />
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
  const {
    register,
    formState: { errors },
    trigger,
    getValues,
  } = useForm<PageGotoAction>({
    shouldFocusError: true,
    mode: 'onBlur',
    resolver: zodResolver(z.object({ url: z.string().url() })),
    defaultValues: action,
  })

  const handleBlur = async () => {
    await trigger('url')

    const data = getValues()
    if (data.url !== action.url) {
      onUpdate(data)
    }
  }

  return (
    <>
      Navigate to{' '}
      <TextField.Root
        size="1"
        color={errors.url ? 'red' : 'gray'}
        variant="soft"
        css={css`
          flex: 1;
        `}
        {...register('url', {
          onBlur: handleBlur,
        })}
        placeholder="e.g. https://quickpizza.grafana.com"
      >
        {errors.url !== undefined && (
          <TextField.Slot side="right" css={{ color: 'var(--red-11)' }}>
            <Tooltip content={errors.url.message || ''}>
              <TriangleAlertIcon />
            </Tooltip>
          </TextField.Slot>
        )}
      </TextField.Root>
    </>
  )
}
