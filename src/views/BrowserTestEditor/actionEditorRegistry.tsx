import { Code } from '@radix-ui/themes'
import {
  CircleQuestionMarkIcon,
  GlobeIcon,
  RefreshCwIcon,
  TimerIcon,
} from 'lucide-react'
import { ReactElement, ReactNode } from 'react'

import {
  GoToActionBody,
  PageReloadActionBody,
  WaitForActionBody,
} from './Actions'
import { BrowserActionInstance } from './types'

type ActionByMethod<M extends BrowserActionInstance['method']> = Extract<
  BrowserActionInstance,
  { method: M }
>

interface ActionEditorProps<M extends BrowserActionInstance['method']> {
  action: ActionByMethod<M>
  onUpdate: (action: ActionByMethod<M>) => void
}

interface ActionEditorDefinition<M extends BrowserActionInstance['method']> {
  icon: ReactNode
  render: (props: ActionEditorProps<M>) => ReactElement
  create: () => ActionByMethod<M>
}

type ActionEditorRegistry = {
  [M in BrowserActionInstance['method']]?: ActionEditorDefinition<M>
}

const notImplementedIcon = <CircleQuestionMarkIcon aria-hidden="true" />

const notImplementedRender = <M extends BrowserActionInstance['method']>({
  action,
}: ActionEditorProps<M>) => (
  <>
    <Code>{action.method}</Code> not implemented
  </>
)

const notImplementedCreate = <M extends BrowserActionInstance['method']>(
  method: M
) => {
  return () => {
    throw new Error(`Action ${method} not implemented yet`)
  }
}

const actionEditors: ActionEditorRegistry = {
  'page.goto': {
    icon: <GlobeIcon aria-hidden="true" />,
    render: ({ action, onUpdate }) => (
      <GoToActionBody action={action} onUpdate={onUpdate} />
    ),
    create: () => ({
      id: crypto.randomUUID(),
      method: 'page.goto',
      url: 'https://example.com',
    }),
  },
  'page.reload': {
    icon: <RefreshCwIcon aria-hidden="true" />,
    render: () => <PageReloadActionBody />,
    create: () => ({
      id: crypto.randomUUID(),
      method: 'page.reload',
    }),
  },
  'locator.waitFor': {
    icon: <TimerIcon aria-hidden="true" />,
    render: ({ action, onUpdate }) => (
      <WaitForActionBody action={action} onUpdate={onUpdate} />
    ),
    create: () => ({
      id: crypto.randomUUID(),
      method: 'locator.waitFor',
      locator: {
        current: 'css',
        values: {
          css: {
            type: 'css',
            selector: '',
          },
        },
      },
    }),
  },
}

export function getActionEditor<M extends BrowserActionInstance['method']>(
  method: M
): ActionEditorDefinition<M> {
  const editor = actionEditors[method]

  if (editor) {
    return editor
  }

  return {
    icon: notImplementedIcon,
    render: notImplementedRender,
    create: notImplementedCreate(method),
  } as ActionEditorDefinition<M>
}

export function getActionEditorForAction<A extends BrowserActionInstance>(
  action: A
): ActionEditorDefinition<A['method']> {
  return getActionEditor(action.method)
}

export function createActionInstance(method: BrowserActionInstance['method']) {
  return getActionEditor(method).create()
}
