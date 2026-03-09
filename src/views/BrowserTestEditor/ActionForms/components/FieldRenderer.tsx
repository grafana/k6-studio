import { css } from '@emotion/react'
import { TextArea, TextField } from '@radix-ui/themes'
import { FieldErrors } from 'react-hook-form'

import { FieldGroup } from '@/components/Form'

import { FieldConfig } from '../fields/types'

import { ComboBox } from './ComboBox'

interface FieldRendererProps<TModel> {
  field: FieldConfig<string, TModel>
  model: TModel
  errors?: FieldErrors
  onChange: (model: TModel) => void
  onBlur?: () => void
}

export function FieldRenderer<TModel>({
  field,
  model,
  errors,
  onChange,
  onBlur,
}: FieldRendererProps<TModel>) {
  const value = field.getValue(model)
  const handleChange = (nextValue: string) => {
    onChange(field.setValue(model, nextValue))
  }

  if (field.input === 'textarea') {
    return (
      <FieldGroup
        name={field.name}
        label={field.label}
        labelSize="1"
        mb="0"
        errors={errors}
        css={css`
          display: grid;
          height: 100%;
          grid-template-rows: auto 1fr;
        `}
      >
        <TextArea
          size="1"
          name={field.name}
          css={css`
            height: 100%;
          `}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={onBlur}
        />
      </FieldGroup>
    )
  }

  if (field.input === 'combobox') {
    return (
      <FieldGroup
        name={field.name}
        label={field.label}
        labelSize="1"
        mb="0"
        errors={errors}
      >
        <ComboBox
          id={field.name}
          value={value}
          options={field.options ?? []}
          onChange={handleChange}
          onBlur={onBlur}
        />
      </FieldGroup>
    )
  }

  return (
    <FieldGroup
      name={field.name}
      label={field.label}
      labelSize="1"
      mb="0"
      errors={errors}
    >
      <TextField.Root
        size="1"
        name={field.name}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={onBlur}
      />
    </FieldGroup>
  )
}
