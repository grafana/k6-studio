export type FieldInput = 'text' | 'number' | 'textarea' | 'combobox' | 'select'

interface FieldConfigBase<TValue, TModel> {
  name: string
  label: string
  input: FieldInput
  clearable?: boolean
  placeholder?: string
  getValue(model: TModel): TValue
  setValue(model: TModel, value: TValue): TModel
  validate?(value: TValue, model?: TModel): string | null
}
interface SelectFieldConfig<TValue, TModel> extends FieldConfigBase<
  TValue,
  TModel
> {
  input: 'select' | 'combobox'
  options: Array<{ label: string; value: string }>
}
interface InputFieldConfig<TValue, TModel> extends FieldConfigBase<
  TValue,
  TModel
> {
  input: 'text' | 'number' | 'textarea'
}

export type FieldConfig<TValue, TModel = TValue> =
  | InputFieldConfig<TValue, TModel>
  | SelectFieldConfig<TValue, TModel>

export function defineField<TValue, TModel = TValue>(
  config: FieldConfig<TValue, TModel>
): FieldConfig<TValue, TModel> {
  return config
}
