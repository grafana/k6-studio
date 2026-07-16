import { css } from '@emotion/react'
import { ToolbarButtonProps } from '@radix-ui/react-toolbar'
import {
  CheckSquareIcon,
  EyeIcon,
  TextCursorInputIcon,
  TimerIcon,
  TypeIcon,
} from 'lucide-react'
import { ComponentProps, ReactNode } from 'react'

import { Toolbar } from '@/components/primitives/Toolbar'
import { ElementRole } from '@/utils/dom/aria'
import { isHTMLTextAreaElement } from '@/utils/dom/realm'

import { AssertionData, CheckAssertionData } from './assertions/types'
import {
  findAssociatedControl,
  getCheckedState,
  getRemoteAssociatedControl,
  getTextBoxValue,
  isNative,
  isNativeRemote,
  LabeledControl,
} from './ElementMenu.utils'
import { getTarget, InspectedElement } from './utils'
import { WaitForData } from './waitConditions/types'

function ToolbarRoot(props: ComponentProps<typeof Toolbar.Root>) {
  return (
    <Toolbar.Root
      css={css`
        display: flex;
        align-items: stretch;
      `}
      {...props}
    />
  )
}

function ToolbarButton(props: ToolbarButtonProps) {
  return (
    <Toolbar.Button
      {...props}
      css={css`
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: var(--studio-spacing-2);
        padding: var(--studio-spacing-2);
        font-size: var(--studio-font-size-1);
      `}
    />
  )
}

interface CategoryProps {
  heading: ReactNode
  children: ReactNode
}

function MenuSection({ heading, children }: CategoryProps) {
  return (
    <>
      <div
        role="separator"
        css={css`
          font-size: var(--studio-font-size-1);
          font-weight: var(--studio-font-weight-medium);
          display: flex;
          align-items: center;
          gap: var(--studio-spacing-2);
          padding: var(--studio-spacing-1);
          padding-right: 0;
        `}
      >
        {heading}
      </div>
      {children}
    </>
  )
}

interface CheckboxCategoryProps {
  role: ElementRole
  input: LabeledControl
  onAddAssertion: (data: CheckAssertionData) => void
}

function CheckboxAssertion({
  role,
  input,
  onAddAssertion,
}: CheckboxCategoryProps) {
  function handleAddCheckAssertion() {
    const isInputNative =
      input.kind === 'live'
        ? isNative(role, input.element)
        : isNativeRemote(role, input.isNativeCheckbox)

    onAddAssertion({
      type: 'check',
      target: input.target,
      inputType: isInputNative ? 'native' : 'aria',
      expected:
        input.kind === 'live'
          ? getCheckedState(input.element)
          : input.checkedState,
    })
  }

  return (
    <ToolbarButton onClick={handleAddCheckAssertion}>
      <CheckSquareIcon /> <div>Add check assertion</div>
    </ToolbarButton>
  )
}

interface TextInputAssertionProps {
  role: ElementRole
  input: LabeledControl
  onAddAssertion: (data: AssertionData) => void
}

function TextInputAssertion({
  input,
  onAddAssertion,
}: TextInputAssertionProps) {
  const handleAddAssertion = () => {
    const multiline =
      input.kind === 'live'
        ? isHTMLTextAreaElement(input.element) ||
          input.element.getAttribute('aria-multiline') === 'true'
        : input.isMultilineTextBox

    onAddAssertion({
      type: 'text-input',
      target: input.target,
      multiline,
      expected:
        input.kind === 'live'
          ? getTextBoxValue(input.element)
          : input.textBoxValue,
    })
  }

  return (
    <ToolbarButton onClick={handleAddAssertion}>
      <TextCursorInputIcon /> <div>Add value assertion</div>
    </ToolbarButton>
  )
}

function toRoleHeading(role: string) {
  switch (role) {
    case 'textbox':
      return 'Text box'

    case 'searchbox':
      return 'Search box'

    default:
      return role.slice(0, 1).toUpperCase() + role.slice(1)
  }
}

interface RoleCategoryProps {
  role: ElementRole
  input: LabeledControl
  onAddAssertion: (assertion: AssertionData) => void
}

function RoleAssertions({ role, input, onAddAssertion }: RoleCategoryProps) {
  switch (role.role) {
    case 'radio':
    case 'checkbox':
    case 'switch':
      return (
        <MenuSection heading={toRoleHeading(role.role)}>
          <CheckboxAssertion
            role={role}
            input={input}
            onAddAssertion={onAddAssertion}
          />
        </MenuSection>
      )

    case 'textbox':
    case 'searchbox':
      return (
        <MenuSection heading={toRoleHeading(role.role)}>
          <TextInputAssertion
            role={role}
            input={input}
            onAddAssertion={onAddAssertion}
          />
        </MenuSection>
      )

    default:
      return null
  }
}

interface ElementMenuProps {
  element: InspectedElement
  onSelectAssertion: (data: AssertionData) => void
  onAddWaitFor: (data: WaitForData) => void
}

export function ElementMenu({
  element,
  onSelectAssertion,
  onAddWaitFor,
}: ElementMenuProps) {
  const associatedElement =
    element.kind === 'live'
      ? findAssociatedControl(element)
      : getRemoteAssociatedControl(element)

  const handleAddVisibilityAssertion = () => {
    onSelectAssertion({
      type: 'visibility',
      target: getTarget(element),
      state: 'visible',
    })
  }

  const handleAddTextAssertion = () => {
    onSelectAssertion({
      type: 'text',
      target: getTarget(element),
      text:
        element.kind === 'live'
          ? (element.element.textContent ?? '')
          : element.state.textContent,
    })
  }

  const handleAddWaitFor = () => {
    onAddWaitFor({
      target: getTarget(element),
    })
  }

  return (
    <ToolbarRoot
      size="1"
      orientation="vertical"
      css={css`
        gap: 0;
      `}
    >
      {associatedElement?.roles.map((role) => {
        return (
          <RoleAssertions
            key={role.role}
            role={role}
            input={associatedElement}
            onAddAssertion={onSelectAssertion}
          />
        )
      })}

      <MenuSection heading="General">
        <ToolbarButton onClick={handleAddVisibilityAssertion}>
          <EyeIcon /> <div>Add visibility assertion</div>
        </ToolbarButton>
        <ToolbarButton onClick={handleAddTextAssertion}>
          <TypeIcon /> <div>Add text assertion</div>
        </ToolbarButton>
      </MenuSection>
      <MenuSection heading="Timing">
        <ToolbarButton onClick={handleAddWaitFor}>
          <TimerIcon /> <div>Wait for element</div>
        </ToolbarButton>
      </MenuSection>
    </ToolbarRoot>
  )
}
