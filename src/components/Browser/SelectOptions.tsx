import { Fragment } from 'react'

interface SelectOption {
  value?: string
  label?: string
  index?: number
}

interface SelectOptionsProps {
  options: Array<SelectOption | string>
}

export function SelectOptions({ options }: SelectOptionsProps) {
  const normalizedOptions = options.map((option) => {
    if (typeof option === 'string') {
      return option
    }

    return option.value ?? option.label ?? option.index?.toString() ?? ''
  })

  if (normalizedOptions.length === 1) {
    return <code>{normalizedOptions[0]}</code>
  }

  const last = normalizedOptions[options.length - 1]

  if (last === undefined) {
    return null
  }

  return (
    <>
      {normalizedOptions.slice(0, -1).map((option, index) => {
        return (
          <Fragment key={index}>
            <code>{option}</code>,{' '}
          </Fragment>
        )
      })}{' '}
      and <code>{last}</code>
    </>
  )
}
