interface SelectOption {
  value?: string
  label?: string
  index?: number
}

interface SelectOptionsProps {
  options: Array<SelectOption | string>
}

function quote(str: string) {
  return `"${str}"`
}

export function formatOption(option: SelectOption | string) {
  if (typeof option === 'string') {
    return quote(option)
  }

  if (option.label !== undefined) {
    return `label: ${quote(option.label)}`
  }

  if (option.index !== undefined) {
    return `index: ${option.index.toString()}`
  }

  return `value: ${quote(option.value ?? '')}`
}

export function SelectOptions({ options }: SelectOptionsProps) {
  if (options.length === 0) {
    return null
  }

  if (options.length === 1) {
    return <code>{formatOption(options[0]!)}</code>
  }

  return <>{options.length} options</>
}
