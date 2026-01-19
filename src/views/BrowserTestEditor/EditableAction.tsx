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

import {
  AnyBrowserAction,
  PageGotoAction,
  PageGotoActionSchema,
} from '@/main/runner/schema'
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
      <IconButton
        size="2"
        variant="ghost"
        color="gray"
        onClick={handleRemove}
        css={{ marginLeft: 'auto' }}
      >
        <Trash2Icon />
      </IconButton>
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
      return <CircleQuestionMarkIcon />
    case 'page.waitForNavigation':
      return <CircleQuestionMarkIcon />
    case 'page.*':
      return <CircleQuestionMarkIcon />
    case 'locator.click':
      return <CircleQuestionMarkIcon />
    case 'locator.dblclick':
      return <CircleQuestionMarkIcon />
    case 'locator.fill':
      return <CircleQuestionMarkIcon />
    case 'locator.type':
      return <CircleQuestionMarkIcon />
    case 'locator.check':
      return <CircleQuestionMarkIcon />
    case 'locator.uncheck':
      return <CircleQuestionMarkIcon />
    case 'locator.selectOption':
      return <CircleQuestionMarkIcon />
    case 'locator.waitFor':
      return <CircleQuestionMarkIcon />
    case 'locator.hover':
      return <CircleQuestionMarkIcon />
    case 'locator.setChecked':
      return <CircleQuestionMarkIcon />
    case 'locator.tap':
      return <CircleQuestionMarkIcon />
    case 'locator.clear':
      return <CircleQuestionMarkIcon />
    case 'locator.press':
      return <CircleQuestionMarkIcon />
    case 'locator.focus':
      return <CircleQuestionMarkIcon />
    case 'locator.*':
      return <CircleQuestionMarkIcon />
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
      return (
        <>
          <Code>{action.method}</Code> not implemented
        </>
      )
    case 'page.waitForNavigation':
      return (
        <>
          <Code>{action.method}</Code> not implemented
        </>
      )
    case 'page.*':
      return (
        <>
          <Code>{action.method}</Code> not implemented
        </>
      )
    case 'locator.click':
      return (
        <>
          <Code>{action.method}</Code> not implemented
        </>
      )
    case 'locator.dblclick':
      return (
        <>
          <Code>{action.method}</Code> not implemented
        </>
      )
    case 'locator.fill':
      return (
        <>
          <Code>{action.method}</Code> not implemented
        </>
      )
    case 'locator.type':
      return (
        <>
          <Code>{action.method}</Code> not implemented
        </>
      )
    case 'locator.check':
      return (
        <>
          <Code>{action.method}</Code> not implemented
        </>
      )
    case 'locator.uncheck':
      return (
        <>
          <Code>{action.method}</Code> not implemented
        </>
      )
    case 'locator.selectOption':
      return (
        <>
          <Code>{action.method}</Code> not implemented
        </>
      )
    case 'locator.waitFor':
      return (
        <>
          <Code>{action.method}</Code> not implemented
        </>
      )
    case 'locator.hover':
      return (
        <>
          <Code>{action.method}</Code> not implemented
        </>
      )
    case 'locator.setChecked':
      return (
        <>
          <Code>{action.method}</Code> not implemented
        </>
      )
    case 'locator.tap':
      return (
        <>
          <Code>{action.method}</Code> not implemented
        </>
      )
    case 'locator.clear':
      return (
        <>
          <Code>{action.method}</Code> not implemented
        </>
      )
    case 'locator.press':
      return (
        <>
          <Code>{action.method}</Code> not implemented
        </>
      )
    case 'locator.focus':
      return (
        <>
          <Code>{action.method}</Code> not implemented
        </>
      )
    case 'locator.*':
      return (
        <>
          <Code>{action.method}</Code> not implemented
        </>
      )
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
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<PageGotoAction>({
    shouldFocusError: true,
    mode: 'onBlur',
    resolver: zodResolver(PageGotoActionSchema),
    defaultValues: action,
  })

  const handleFormSubmit = handleSubmit((data) => {
    console.log('GoToActionBody submit', data)
    onUpdate(data)
  })

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
          onBlur: handleFormSubmit,
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
