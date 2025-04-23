import { css } from '@emotion/react'
import {
  TriangleLeftIcon,
  TriangleRightIcon,
  EyeOpenIcon,
  TextIcon,
} from '@radix-ui/react-icons'
import { FormEvent, useEffect, useId, useState } from 'react'

import { Button } from '@/components/primitives/Button'
import { DropdownMenu } from '@/components/primitives/DropdownMenu'
import { FieldSet } from '@/components/primitives/FieldSet'
import { Flex } from '@/components/primitives/Flex'
import { RadioGroup } from '@/components/primitives/RadioGroup'
import { Toolbar } from '@/components/primitives/Toolbar'
import { Tooltip } from '@/components/primitives/Tooltip'
import { Assertion } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'

import { client } from '../routing'

import { Anchor } from './Anchor'
import { TrackedElement, useInspectedElement } from './ElementInspector.hooks'
import { Overlay } from './Overlay'
import { useEscape } from './hooks/useEscape'

function toAssertion(values: AssertionValues): Assertion {
  switch (values.type) {
    case 'visibility':
      return {
        type: 'visibility',
        visible: values.state === 'visible',
      }

    default:
      return exhaustive(values.type)
  }
}

function asLiteral<T extends string>(
  keys: [...T[]],
  callback: (value: T) => void
) {
  return (value: string) => {
    if ((keys as string[]).includes(value)) {
      callback(value as T)
    }
  }
}

type ByType<T extends { type: string }> = {
  [K in T['type']]: Extract<T, { type: K }>
}

interface VisibilityAssertionValues {
  type: 'visibility'
  state: 'visible' | 'hidden'
}

type AssertionValues = VisibilityAssertionValues

type AssertionValuesMap = ByType<AssertionValues>

interface VisibilityAssertionEditorProps {
  state: AssertionValues
  onChange: (state: AssertionValues) => void
}

function VisibilityAssertionForm({
  state,
  onChange,
}: VisibilityAssertionEditorProps) {
  const hiddenId = useId()
  const visibleId = useId()

  const handleValueChange = asLiteral(['visible', 'hidden'], (value) => {
    onChange({
      ...state,
      state: value,
    })
  })

  return (
    <Flex px="2">
      <FieldSet>
        <legend>Expected visibility:</legend>
        <RadioGroup.Root
          orientation="horizontal"
          value={state.state}
          onValueChange={handleValueChange}
        >
          <Flex align="center" gap="1">
            <RadioGroup.Item id={visibleId} value="visible" />
            <label htmlFor={visibleId}>Visible</label>
          </Flex>
          <Flex align="center" gap="1">
            <RadioGroup.Item id={hiddenId} value="hidden" />
            <label htmlFor={hiddenId}>Hidden</label>
          </Flex>
        </RadioGroup.Root>
      </FieldSet>
    </Flex>
  )
}

interface AssertionFormProps {
  selected: AssertionValues['type']
  form: AssertionValuesMap
  onChange: (assertion: AssertionValuesMap) => void
}

function AssertionForm({ selected, form, onChange }: AssertionFormProps) {
  const current = form[selected]

  function handleVisibilityChange(visibility: AssertionValues) {
    onChange({
      ...form,
      visibility,
    })
  }

  switch (current.type) {
    case 'visibility':
      return (
        <VisibilityAssertionForm
          state={current}
          onChange={handleVisibilityChange}
        />
      )

    default:
      return exhaustive(current.type)
  }
}

interface OnAssertEvent {
  element: TrackedElement
  assertion: AssertionValues
}

interface ElementOptionsProps {
  element: TrackedElement
  onAssert: (event: OnAssertEvent) => void
  onExpandSelection: (() => void) | undefined
  onContractSelection: (() => void) | undefined
}

function _ElementOptions({
  element,
  onAssert,
  onExpandSelection,
  onContractSelection,
}: ElementOptionsProps) {
  const [value, setValue] = useState<AssertionValues['type'] | ''>('')

  const [form, setForm] = useState<AssertionValuesMap>({
    visibility: {
      type: 'visibility',
      state: 'visible',
    },
  })

  const handleSelectedChange = asLiteral(['visibility', ''], setValue)

  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault()

    if (value === '') {
      return
    }

    onAssert({
      element,
      assertion: form[value],
    })

    setValue('')
  }

  return (
    <Flex direction="column" align="stretch">
      <Toolbar.Root
        css={css`
          gap: 0;
        `}
      >
        <Tooltip asChild content="Expand selection.">
          <div>
            <Toolbar.Button
              disabled={onExpandSelection === undefined}
              onClick={onExpandSelection}
            >
              <TriangleLeftIcon />
            </Toolbar.Button>
          </div>
        </Tooltip>
        <Tooltip asChild content="Contract selection.">
          <div>
            <Toolbar.Button
              disabled={onContractSelection === undefined}
              onClick={onContractSelection}
            >
              <TriangleRightIcon />
            </Toolbar.Button>
          </div>
        </Tooltip>
        <div
          css={css`
            align-self: stretch;
            display: flex;
            align-items: center;
            padding: 0 var(--studio-spacing-2);
            min-width: 200px;
            border-left: 1px solid var(--studio-border-color);
            border-right: 1px solid var(--studio-border-color);
          `}
        >
          <strong>{element.selector.css}</strong>
        </div>
        <Toolbar.ToggleGroup
          type="single"
          value={value}
          onValueChange={handleSelectedChange}
        >
          <Tooltip asChild content="Assert that the element is visible.">
            <div>
              <Toolbar.ToggleItem value="visibility">
                <EyeOpenIcon />
              </Toolbar.ToggleItem>
            </div>
          </Tooltip>
        </Toolbar.ToggleGroup>
      </Toolbar.Root>
      {value !== '' && (
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="1" p="2" align="start">
            <AssertionForm selected={value} form={form} onChange={setForm} />
            <Button
              css={css`
                align-self: flex-end;
              `}
              type="submit"
              size="1"
            >
              Add assertion
            </Button>
          </Flex>
        </form>
      )}
    </Flex>
  )
}

interface ElementInspectorProps {
  onCancel: () => void
}

export function ElementInspector({ onCancel }: ElementInspectorProps) {
  const { pinned, element, mousePosition, unpin, expand, contract } =
    useInspectedElement()

  useEscape(() => {
    if (pinned) {
      unpin()

      return
    }

    onCancel()
  }, [pinned, onCancel])

  useEffect(() => {
    client.send({
      type: 'highlight-elements',
      selector: element && {
        type: 'css',
        selector: element.selector.css,
      },
    })
  }, [element])

  useEffect(() => {
    return () => {
      client.send({
        type: 'highlight-elements',
        selector: null,
      })
    }
  }, [])

  const _handleAssert = (event: OnAssertEvent) => {
    client.send({
      type: 'record-events',
      events: [
        {
          type: 'assert',
          eventId: crypto.randomUUID(),
          timestamp: Date.now(),
          tab: '',
          selector: event.element.selector,
          assertion: toAssertion(event.assertion),
        },
      ],
    })
  }

  if (element === null) {
    return null
  }

  if (pinned === null) {
    return (
      <Tooltip.Root open={true}>
        <Tooltip.Trigger asChild>
          <Overlay bounds={element.bounds} />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            data-inspector-tooltip
            css={css`
              font-weight: 500;
            `}
          >
            <Tooltip.Arrow />
            <strong>{element.selector.css}</strong>
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    )
  }

  return (
    <DropdownMenu.Root open>
      <DropdownMenu.Trigger asChild>
        <Anchor position={mousePosition} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="bottom"
          sideOffset={8}
          css={css`
            font-size: var(--studio-font-size-1);
          `}
        >
          <DropdownMenu.Arrow />
          <Toolbar.Root
            size="1"
            css={css`
              gap: 0;
              font-size: 0.9em;
            `}
          >
            <Tooltip asChild content="Expand selection.">
              <div>
                <Toolbar.Button
                  disabled={expand === undefined}
                  onClick={expand}
                >
                  <TriangleLeftIcon />
                </Toolbar.Button>
              </div>
            </Tooltip>
            <Tooltip asChild content="Contract selection.">
              <div>
                <Toolbar.Button
                  disabled={contract === undefined}
                  onClick={contract}
                >
                  <TriangleRightIcon />
                </Toolbar.Button>
              </div>
            </Tooltip>
            <div
              css={css`
                align-self: stretch;
                display: flex;
                align-items: center;
                padding: 0 var(--studio-spacing-2);
                min-width: 200px;
                border-left: 1px solid var(--studio-border-color);
              `}
            >
              <strong>{element.selector.css}</strong>
            </div>
          </Toolbar.Root>
          <DropdownMenu.Separator />
          <DropdownMenu.Item>
            <EyeOpenIcon /> <div>Add visibility assertion</div>
          </DropdownMenu.Item>
          <DropdownMenu.Item>
            <TextIcon /> <div>Add text assertion</div>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
