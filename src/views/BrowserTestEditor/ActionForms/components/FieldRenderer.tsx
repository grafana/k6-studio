import { css } from '@emotion/react'
import { Select, TextArea, TextField } from '@radix-ui/themes'
import { FieldErrors } from 'react-hook-form'

import { FieldGroup } from '@/components/Form'
import { exhaustive } from '@/utils/typescript'

import { FieldConfig } from '../fields/types'

import { ComboBox } from './ComboBox'

interface FieldRendererProps<TValue, TModel> {
  field: FieldConfig<TValue, TModel>
  model: TModel
  errors?: FieldErrors
  onChange: (model: TModel) => void
  onBlur?: () => void
}

export function FieldRenderer<TValue, TModel>({
  field,
  model,
  errors,
  onChange,
  onBlur,
}: FieldRendererProps<TValue, TModel>) {
  const value = field.getValue(model)
  const handleChange = (nextValue: TValue) => {
    onChange(field.setValue(model, nextValue))
  }

  const handleTextChange = (nextValue: string) => {
    handleChange(nextValue as unknown as TValue)
  }

  const textValue = value == null ? '' : String(value)

  switch (field.input) {
    case 'number':
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
            type="number"
            value={textValue}
            placeholder={field.placeholder}
            onChange={(e) => handleTextChange(e.target.value)}
            onBlur={onBlur}
          />
        </FieldGroup>
      )
    case 'text':
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
            value={textValue}
            placeholder={field.placeholder}
            onChange={(e) => handleTextChange(e.target.value)}
            onBlur={onBlur}
          />
        </FieldGroup>
      )
    case 'textarea':
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
            placeholder={field.placeholder}
            value={textValue}
            onChange={(e) => handleTextChange(e.target.value)}
            onBlur={onBlur}
          />
        </FieldGroup>
      )
    case 'select': {
      const selectValue = value == null ? undefined : String(value)

      return (
        <FieldGroup
          name={field.name}
          label={field.label}
          labelSize="1"
          mb="0"
          errors={errors}
        >
          <Select.Root
            name={field.name}
            size="1"
            value={selectValue}
            onValueChange={(value) => {
              handleTextChange(value)
              onBlur?.()
            }}
          >
            <Select.Trigger
              placeholder={field.placeholder}
              css={css`
                width: 100%;
              `}
            />
            <Select.Content>
              {field.options?.map((opt) => (
                <Select.Item key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </FieldGroup>
      )
    }
    case 'combobox':
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
            value={textValue}
            placeholder={field.placeholder}
            options={field.options ?? []}
            onChange={handleTextChange}
            onBlur={onBlur}
          />
        </FieldGroup>
      )
    default:
      return exhaustive(field.input)
  }
}
