import { css } from '@emotion/react'
import { ToolbarButtonProps } from '@radix-ui/react-toolbar'
import { CheckSquareIcon, EyeIcon, TypeIcon } from 'lucide-react'
import { ComponentProps, ReactNode } from 'react'

import { Toolbar } from '@/components/primitives/Toolbar'
import { ElementSelector } from '@/schemas/recording'
import { generateSelector } from 'extension/src/selectors'
import { ElementRole, getElementRoles } from 'extension/src/utils/aria'

import { TrackedElement } from './ElementInspector.hooks'
import { AssertionData, CheckAssertionData } from './assertions/types'

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

function CategorySeparator({ children }: { children: ReactNode }) {
  return (
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
      {children}
    </div>
  )
}

function findByForAttribute(target: HTMLLabelElement) {
  const forAttribute = target.getAttribute('for')

  if (forAttribute === null) {
    return null
  }

  return document.getElementById(forAttribute)
}

const CHILD_INPUT_SELECTOR = [
  // Hidden inputs are not labelable per the HTML specification
  'input:not([type="hidden"])',
  'select',
  'textarea',
  '[role="checkbox"]',
].join(', ')

function findInChildren(target: HTMLLabelElement) {
  // According to the HTML specification, the labelled element is the first one
  // in "tree order" which is the same order that `querySelector` searches in.
  return target.querySelector(CHILD_INPUT_SELECTOR)
}

function findByLabelledBy(target: HTMLLabelElement) {
  if (target.id === '') {
    return null
  }

  return target.querySelector(`[aria-labelledby="${target.id}"]`)
}

function* getAncestors(element: Element) {
  let currentElement: Element | null = element

  while (currentElement !== null) {
    yield currentElement

    currentElement = currentElement.parentElement
  }
}

interface LabeledControl {
  element: Element
  selector: ElementSelector
  roles: ElementRole[]
}

function findLabeledControl({
  target,
  selector,
  roles,
}: TrackedElement): LabeledControl | null {
  if (target instanceof HTMLInputElement) {
    return {
      element: target,
      selector,
      roles,
    }
  }

  const label = [...getAncestors(target)].find(
    (ancestor) => ancestor instanceof HTMLLabelElement
  )

  if (label === undefined) {
    return null
  }

  const element =
    findByForAttribute(label) ??
    findInChildren(label) ??
    findByLabelledBy(label)

  // if (target instanceof HTMLLabelElement === false) {
  //   return null
  // }

  // const element =
  //   findByForAttribute(target) ??
  //   findInChildren(target) ??
  //   findByLabelledBy(target)

  if (element === null) {
    return null
  }

  return {
    element,
    selector: generateSelector(element),
    roles: [...getElementRoles(element)],
  }
}

function getCheckedState(element: Element): CheckAssertionData['expected'] {
  if (element instanceof HTMLInputElement) {
    if (element.indeterminate) {
      return 'indeterminate'
    }

    return element.checked ? 'checked' : 'unchecked'
  }

  switch (element.getAttribute('aria-checked')) {
    case 'true':
      return 'checked'

    case 'false':
      return 'unchecked'

    case 'mixed':
      return 'indeterminate'

    default:
      return 'unchecked'
  }
}

interface CheckboxCategoryProps {
  input: LabeledControl
  onAddAssertion: (data: CheckAssertionData) => void
}

function CheckboxCategory({ input, onAddAssertion }: CheckboxCategoryProps) {
  const role = input.roles.find((role) => role.role === 'checkbox')

  if (role === undefined) {
    return null
  }

  function handleAddCheckAssertion() {
    if (role === undefined) {
      return
    }

    onAddAssertion({
      type: 'check',
      selector: input.selector.css,
      inputType: role.type === 'intrinsic' ? 'html' : 'aria',
      expected: getCheckedState(input.element),
    })
  }

  return (
    <>
      <CategorySeparator>Checkbox</CategorySeparator>
      <ToolbarButton onClick={handleAddCheckAssertion}>
        <CheckSquareIcon /> <div>Add check assertion</div>
      </ToolbarButton>
    </>
  )
}

interface RadioCategoryProps {
  input: LabeledControl
  onAddAssertion: (data: CheckAssertionData) => void
}

function RadioCategory({ input, onAddAssertion }: RadioCategoryProps) {
  const role = input.roles.find((role) => role.role === 'radio')

  if (role === undefined) {
    return null
  }

  function handleAddCheckAssertion() {
    if (role === undefined) {
      return
    }

    onAddAssertion({
      type: 'check',
      selector: input.selector.css,
      inputType: role.type === 'intrinsic' ? 'html' : 'aria',
      expected: getCheckedState(input.element),
    })
  }

  return (
    <>
      <CategorySeparator>Radio</CategorySeparator>
      <ToolbarButton onClick={handleAddCheckAssertion}>
        <CheckSquareIcon /> <div>Add check assertion</div>
      </ToolbarButton>
    </>
  )
}

interface ElementMenuProps {
  element: TrackedElement
  onSelectAssertion: (data: AssertionData) => void
}

export function ElementMenu({ element, onSelectAssertion }: ElementMenuProps) {
  const inputElement = findLabeledControl(element)

  const handleAddVisibilityAssertion = () => {
    onSelectAssertion({
      type: 'visibility',
      selector: element.selector.css,
      state: 'visible',
    })
  }

  const handleAddTextAssertion = () => {
    onSelectAssertion({
      type: 'text',
      selector: element.selector.css,
      text: element.target.textContent ?? '',
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
      {inputElement !== null && (
        <>
          <CheckboxCategory
            input={inputElement}
            onAddAssertion={onSelectAssertion}
          />
          <RadioCategory
            input={inputElement}
            onAddAssertion={onSelectAssertion}
          />
        </>
      )}

      <CategorySeparator>General</CategorySeparator>
      <ToolbarButton onClick={handleAddVisibilityAssertion}>
        <EyeIcon /> <div>Add visibility assertion</div>
      </ToolbarButton>
      <ToolbarButton onClick={handleAddTextAssertion}>
        <TypeIcon /> <div>Add text assertion</div>
      </ToolbarButton>
    </ToolbarRoot>
  )
}
