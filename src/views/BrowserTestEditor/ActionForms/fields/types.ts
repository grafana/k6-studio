export type FieldInput = 'text' | 'number' | 'textarea' | 'combobox' | 'select'

export type FieldConfig<TValue, TModel = TValue> = {
  name: string
  label: string
  input: FieldInput
  clearable?: boolean
  placeholder?: string
  options?: Array<{ label: string; value: string }>
  getValue(model: TModel): TValue
  setValue(model: TModel, value: TValue): TModel
  validate?(value: TValue, model?: TModel): string | null
}

export function defineField<TValue, TModel = TValue>(
  config: FieldConfig<TValue, TModel>
): FieldConfig<TValue, TModel> {
  return config
}
