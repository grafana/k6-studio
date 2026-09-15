import { Grid, RadioGroup, Separator } from '@radix-ui/themes'
import { ReactElement } from 'react'

import { FieldGroup } from '@/components/Form'
import {
  ElementLocator,
  initializeLocatorValues,
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
import { FieldErrors } from './locators/validation'

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

interface LocatorEditorProps<Locator extends LocatorOptions> {
  isTouched: boolean
  locator: Locator
  fieldErrors: FieldErrors
  suggestedRoles?: string[]
  onChange: (newState: Locator) => void
  onFieldBlur: (locator: Locator) => void
}

/**
 * The "Get by" type selector plus the fields for the selected locator type.
 * Fully controlled; validation state lives in the owner.
 */
export function LocatorEditor<Locator extends LocatorOptions>({
  isTouched,
  locator,
  fieldErrors,
  suggestedRoles,
  onChange,
  onFieldBlur,
}: LocatorEditorProps<Locator>): ReactElement {
  const handleTypeChange = (type: ElementLocator['type']) => {
    if (type in LOCATOR_TYPES === false) {
      return
    }

    onChange({
      ...locator,
      current: type,
      values: {
        ...locator.values,
        [type]: locator.values[type] ?? initializeLocatorValues(type),
      },
    })
  }

  const handleFieldBlur = () => {
    onFieldBlur(locator)
  }

  return (
    <Grid gap="3" flexGrow="1" columns="auto auto 1fr">
      <FieldGroup name="locator-type" label="Get by" labelSize="1" mb="0">
        <RadioGroup.Root
          size="1"
          name="locator-type"
          value={locator.current}
          onValueChange={handleTypeChange}
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
        locator={locator}
        isTouched={isTouched}
        errors={fieldErrors}
        suggestedRoles={suggestedRoles}
        onChange={onChange}
        onBlur={handleFieldBlur}
      />
    </Grid>
  )
}

interface LocatorFieldsFormProps<Locator extends LocatorOptions> {
  isTouched: boolean
  locator: Locator
  errors: FieldErrors
  suggestedRoles?: string[]
  onChange: (locator: Locator) => void
  onBlur?: () => void
}

function LocatorFieldsForm<Locator extends LocatorOptions>({
  isTouched,
  locator,
  errors,
  suggestedRoles,
  onChange,
  onBlur,
}: LocatorFieldsFormProps<Locator>) {
  const handleLocatorChange = (newLocator: ElementLocator) => {
    onChange({
      ...locator,
      values: {
        ...locator.values,
        [newLocator.type]: newLocator,
      },
    })
  }

  switch (locator.current) {
    case 'role':
      return (
        <GetByRoleForm
          locator={locator.values.role}
          isTouched={isTouched}
          errors={errors.role}
          onChange={handleLocatorChange}
          onBlur={onBlur}
          suggestedRoles={suggestedRoles}
        />
      )

    case 'css':
      return (
        <GetByCssForm
          locator={locator.values.css}
          isTouched={isTouched}
          errors={errors.css}
          onChange={handleLocatorChange}
          onBlur={onBlur}
        />
      )

    case 'testid':
      return (
        <GetByTestIdForm
          locator={locator.values.testid}
          isTouched={isTouched}
          errors={errors.testid}
          onChange={handleLocatorChange}
          onBlur={onBlur}
        />
      )

    case 'label':
      return (
        <GetByLabelForm
          locator={locator.values.label}
          isTouched={isTouched}
          errors={errors.label}
          onChange={handleLocatorChange}
          onBlur={onBlur}
        />
      )

    case 'placeholder':
      return (
        <GetByPlaceholderForm
          locator={locator.values.placeholder}
          isTouched={isTouched}
          errors={errors.placeholder}
          onChange={handleLocatorChange}
          onBlur={onBlur}
        />
      )

    case 'title':
      return (
        <GetByTitleForm
          locator={locator.values.title}
          isTouched={isTouched}
          errors={errors.title}
          onChange={handleLocatorChange}
          onBlur={onBlur}
        />
      )

    case 'alt':
      return (
        <GetByAltTextForm
          locator={locator.values.alt}
          isTouched={isTouched}
          errors={errors.alt}
          onChange={handleLocatorChange}
          onBlur={onBlur}
        />
      )

    case 'text':
      return (
        <GetByTextForm
          locator={locator.values.text}
          isTouched={isTouched}
          errors={errors.text}
          onChange={handleLocatorChange}
          onBlur={onBlur}
        />
      )

    default:
      return exhaustive(locator.current)
  }
}
