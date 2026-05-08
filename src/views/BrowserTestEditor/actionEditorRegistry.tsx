import { Code } from '@radix-ui/themes'
import {
  CircleQuestionMarkIcon,
  ClockIcon,
  EraserIcon,
  EyeIcon,
  GlobeIcon,
  ListChecksIcon,
  MousePointerClickIcon,
  RefreshCwIcon,
  SquareCheckBigIcon,
  SquareIcon,
  TextCursorInputIcon,
  TimerIcon,
} from 'lucide-react'
import { ReactElement, ReactNode } from 'react'

import { AnyBrowserAction } from '@/schemas/browserTest'

import {
  CheckActionBody,
  ClearActionBody,
  ClickActionBody,
  FillActionBody,
  GoToActionBody,
  PageReloadActionBody,
  SelectOptionActionBody,
  ToBeCheckedActionBody,
  UncheckActionBody,
  WaitForActionBody,
  WaitForTimeoutActionBody,
} from './Actions'

type ActionByMethod<M extends AnyBrowserAction['method']> = Extract<
  AnyBrowserAction,
  { method: M }
>

interface ActionEditorProps<M extends AnyBrowserAction['method']> {
  action: ActionByMethod<M>
  onChange: (action: ActionByMethod<M>) => void
}

interface ActionEditorDefinition<M extends AnyBrowserAction['method']> {
  icon: ReactNode
  render: (props: ActionEditorProps<M>) => ReactElement
  summaryExcludeKeys?: readonly string[]
}

type ActionEditorRegistry = {
  [M in AnyBrowserAction['method']]?: ActionEditorDefinition<M>
}

const notImplementedIcon = <CircleQuestionMarkIcon aria-hidden="true" />

const notImplementedRender = <M extends AnyBrowserAction['method']>({
  action,
}: ActionEditorProps<M>) => (
  <>
    <Code>{action.method}</Code> not implemented
  </>
)

const actionEditors: ActionEditorRegistry = {
  'locator.check': {
    icon: <SquareCheckBigIcon aria-hidden="true" />,
    render: ({ action, onChange }) => (
      <CheckActionBody action={action} onChange={onChange} />
    ),
  },
  'locator.uncheck': {
    icon: <SquareIcon aria-hidden="true" />,
    render: ({ action, onChange }) => (
      <UncheckActionBody action={action} onChange={onChange} />
    ),
  },
  'locator.clear': {
    icon: <EraserIcon aria-hidden="true" />,
    render: ({ action, onChange }) => (
      <ClearActionBody action={action} onChange={onChange} />
    ),
  },
  'locator.click': {
    icon: <MousePointerClickIcon aria-hidden="true" />,
    render: ({ action, onChange }) => (
      <ClickActionBody action={action} onChange={onChange} />
    ),
    summaryExcludeKeys: ['button'],
  },
  'locator.fill': {
    icon: <TextCursorInputIcon aria-hidden="true" />,
    render: ({ action, onChange }) => (
      <FillActionBody action={action} onChange={onChange} />
    ),
  },
  'locator.selectOption': {
    icon: <ListChecksIcon aria-hidden="true" />,
    render: ({ action, onChange }) => (
      <SelectOptionActionBody action={action} onChange={onChange} />
    ),
  },
  'locator.toBeChecked': {
    icon: <EyeIcon aria-hidden="true" />,
    render: ({ action, onChange }) => (
      <ToBeCheckedActionBody action={action} onChange={onChange} />
    ),
  },
  'page.goto': {
    icon: <GlobeIcon aria-hidden="true" />,
    render: ({ action, onChange }) => (
      <GoToActionBody action={action} onChange={onChange} />
    ),
  },
  'page.reload': {
    icon: <RefreshCwIcon aria-hidden="true" />,
    render: () => <PageReloadActionBody />,
  },
  'page.waitForTimeout': {
    icon: <ClockIcon aria-hidden="true" />,
    render: ({ action, onChange }) => (
      <WaitForTimeoutActionBody action={action} onChange={onChange} />
    ),
  },
  'locator.waitFor': {
    icon: <TimerIcon aria-hidden="true" />,
    render: ({ action, onChange }) => (
      <WaitForActionBody action={action} onChange={onChange} />
    ),
  },
}

export function getActionEditor<M extends AnyBrowserAction['method']>(
  method: M
): ActionEditorDefinition<M> {
  const editor = actionEditors[method]

  if (editor) {
    return editor
  }

  return {
    icon: notImplementedIcon,
    render: notImplementedRender,
  } as ActionEditorDefinition<M>
}

export function getActionEditorForAction<A extends AnyBrowserAction>(
  action: A
): ActionEditorDefinition<A['method']> {
  return getActionEditor(action.method)
}
