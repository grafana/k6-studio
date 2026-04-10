import { Code } from '@radix-ui/themes'
import {
  CircleQuestionMarkIcon,
  GlobeIcon,
  MousePointerClickIcon,
  RefreshCwIcon,
  SquareCheckBigIcon,
  SquareIcon,
  TextCursorInputIcon,
  TimerIcon,
} from 'lucide-react'
import { ReactElement, ReactNode } from 'react'

import {
  CheckActionBody,
  ClickActionBody,
  FillActionBody,
  GoToActionBody,
  PageReloadActionBody,
  UncheckActionBody,
  WaitForActionBody,
} from './Actions'
import { BrowserActionInstance } from './types'
import { createDefaultLocatorOptions } from './utils'

type ActionByMethod<M extends BrowserActionInstance['method']> = Extract<
  BrowserActionInstance,
  { method: M }
>

interface ActionEditorProps<M extends BrowserActionInstance['method']> {
  action: ActionByMethod<M>
  onChange: (action: ActionByMethod<M>) => void
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
  'locator.check': {
    icon: <SquareCheckBigIcon aria-hidden="true" />,
    render: ({ action, onChange }) => (
      <CheckActionBody action={action} onChange={onChange} />
    ),
    create: () => ({
      id: crypto.randomUUID(),
      method: 'locator.check',
      locator: {
        current: 'role',
        values: {
          role: {
            type: 'role',
            role: 'checkbox',
          },
        },
      },
    }),
  },
  'locator.uncheck': {
    icon: <SquareIcon aria-hidden="true" />,
    render: ({ action, onChange }) => (
      <UncheckActionBody action={action} onChange={onChange} />
    ),
    create: () => ({
      id: crypto.randomUUID(),
      method: 'locator.uncheck',
      locator: {
        current: 'role',
        values: {
          role: {
            type: 'role',
            role: 'checkbox',
          },
        },
      },
    }),
  },
  'locator.click': {
    icon: <MousePointerClickIcon aria-hidden="true" />,
    render: ({ action, onChange }) => (
      <ClickActionBody action={action} onChange={onChange} />
    ),
    create: () => ({
      id: crypto.randomUUID(),
      method: 'locator.click',
      locator: createDefaultLocatorOptions(),
    }),
  },
  'locator.fill': {
    icon: <TextCursorInputIcon aria-hidden="true" />,
    render: ({ action, onChange }) => (
      <FillActionBody action={action} onChange={onChange} />
    ),
    create: () => ({
      id: crypto.randomUUID(),
      method: 'locator.fill',
      value: '',
      locator: {
        current: 'role',
        values: {
          role: {
            type: 'role',
            role: 'textbox',
          },
        },
      },
    }),
  },
  'page.goto': {
    icon: <GlobeIcon aria-hidden="true" />,
    render: ({ action, onChange }) => (
      <GoToActionBody action={action} onChange={onChange} />
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
    render: ({ action, onChange }) => (
      <WaitForActionBody action={action} onChange={onChange} />
    ),
    create: () => ({
      id: crypto.randomUUID(),
      method: 'locator.waitFor',
      locator: createDefaultLocatorOptions(),
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
