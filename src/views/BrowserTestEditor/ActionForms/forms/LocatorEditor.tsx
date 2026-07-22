import { Grid, RadioGroup, Separator } from '@radix-ui/themes'
import { ReactElement } from 'react'

import { FieldGroup } from '@/components/Form'
import {
  ElementLocator,
  getCurrentLocator,
  LocatorOptions,
} from '@/schemas/locator'
import { exhaustive } from '@/utils/typescript'

import {
  GetByAltTextForm,
  GetByCssForm,
  GetByLabelForm,
  GetByPlaceholderForm,
  GetByRoleForm,
  GetByTestIdForm,
  GetByTextForm,
  GetByTitleForm,
} from './locators'

const LOCATOR_TYPES: Record<ElementLocator['type'], string> = {
  role: 'ARIA Role',
  label: 'Form label',
  alt: 'Alt text',
  placeholder: 'Placeholder',
  testid: 'Test ID',
  text: 'Text content',
  title: 'Title',
  css: 'CSS selector',
}

interface LocatorEditorProps {
  state: LocatorOptions
  fieldErrors?: Record<string, string>
  suggestedRoles?: string[]
  onTypeChange: (type: LocatorOptions['current']) => void
  onLocatorChange: (locator: ElementLocator) => void
  onFieldBlur: () => void
}

/**
 * The "Get by" type selector plus the fields for the selected locator type.
 * Fully controlled; validation state lives in the owner.
 */
export function LocatorEditor({
  state,
  fieldErrors,
  suggestedRoles,
  onTypeChange,
  onLocatorChange,
  onFieldBlur,
}: LocatorEditorProps): ReactElement {
  return (
    <Grid gap="3" flexGrow="1" columns="auto auto 1fr">
      <FieldGroup name="locator-type" label="Get by" labelSize="1" mb="0">
        <RadioGroup.Root
          size="1"
          name="locator-type"
          value={state.current}
          onValueChange={onTypeChange}
        >
          {Object.entries(LOCATOR_TYPES)
            // TODO: temporarily hide 'text' until codegen support is added
            .filter(([type]) => type !== 'text')
            .map(([type, label]) => (
              <RadioGroup.Item value={type} key={type}>
                {label}
              </RadioGroup.Item>
            ))}
        </RadioGroup.Root>
      </FieldGroup>

      <Separator orientation="vertical" size="4" decorative />
      <LocatorFieldsForm
        locator={getCurrentLocator(state)}
        errors={fieldErrors}
        onChange={onLocatorChange}
        onBlur={onFieldBlur}
        suggestedRoles={suggestedRoles}
      />
    </Grid>
  )
}

interface LocatorFieldsFormProps {
  locator: ElementLocator
  errors?: Record<string, string>
  onChange: (locator: ElementLocator) => void
  onBlur?: () => void
  suggestedRoles?: string[]
}

function LocatorFieldsForm({
  locator,
  errors,
  onChange,
  onBlur,
  suggestedRoles,
}: LocatorFieldsFormProps) {
  switch (locator.type) {
    case 'role':
      return (
        <GetByRoleForm
          locator={locator}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
          suggestedRoles={suggestedRoles}
        />
      )
    case 'css':
      return (
        <GetByCssForm
          locator={locator}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
        />
      )
    case 'testid':
      return (
        <GetByTestIdForm
          locator={locator}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
        />
      )
    case 'label':
      return (
        <GetByLabelForm
          locator={locator}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
        />
      )
    case 'placeholder':
      return (
        <GetByPlaceholderForm
          locator={locator}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
        />
      )
    case 'title':
      return (
        <GetByTitleForm
          locator={locator}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
        />
      )
    case 'alt':
      return (
        <GetByAltTextForm
          locator={locator}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
        />
      )
    case 'text':
      return (
        <GetByTextForm
          locator={locator}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
        />
      )
    default:
      return exhaustive(locator)
  }
}
