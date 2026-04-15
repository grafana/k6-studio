import { css } from '@emotion/react'
import { Fragment } from 'react'

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

function formatOption(option: SelectOption | string) {
  if (typeof option === 'string') {
    return quote(option)
  }

  if (option.label !== undefined) {
    return option.label.length ? (
      option.label
    ) : (
      <span
        css={css`
          opacity: 0.8;
          font-style: italic;
        `}
      >
        (empty)
      </span>
    )
  }

  if (option.index !== undefined) {
    return option.index.toString()
  }

  return quote(option.value ?? '')
}

export function SelectOptions({ options }: SelectOptionsProps) {
  if (options.length === 0) {
    return null
  }

  if (options.length === 1) {
    return <code>{formatOption(options[0]!)}</code>
  }

  const last = options[options.length - 1]!

  return (
    <>
      {options.slice(0, -1).map((option, index) => (
        <Fragment key={index}>
          <code>{formatOption(option)}</code>,{' '}
        </Fragment>
      ))}{' '}
      and <code>{formatOption(last)}</code>
    </>
  )
}
