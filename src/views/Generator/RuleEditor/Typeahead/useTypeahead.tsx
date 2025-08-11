import * as React from 'react'

import type { TypeaheadProps } from '@/views/Generator/RuleEditor/Typeahead/Typeahead'

/**
 * Temporary feature flagging, we can use this to experiment with different use cases
 *
 * onDot: Will render suggestions on the first dot
 * onFirstKey: will render suggestions on the first key (unoptimized: WARNING DO NOT USE IN PRODUCTION UNTIL LAZY LOADING IS BUILT)
 * onThirdKey: will render suggestions on the third key
 */
export type SuggestionMode = 'onDot' | 'onFirstKey' | 'onThirdKey'
type ExternalProps = Omit<TypeaheadProps, 'options' | 'mode'>
const defaultSuggestionMode: SuggestionMode = 'onDot'

function checkKeyPrefixes(value: string, mode: SuggestionMode) {
  if (mode === 'onDot') return value.includes('.')
  if (mode === 'onFirstKey') return value.length >= 1
  if (mode === 'onThirdKey') return value.length >= 3
  return false
}

export function useTypeahead(
  options: string[],
  props: ExternalProps = {},
  mode: SuggestionMode = defaultSuggestionMode
) {
  const {
    value: extValue,
    defaultValue: extDefaultValue,
    onChange: extOnChange,
    onBlur: extOnBlur,
    ...restProps
  } = props

  const isControlled = extValue !== undefined
  const [inputValue, setInputValue] = React.useState<string>(
    isControlled
      ? String(extValue)
      : extDefaultValue != null
        ? String(extDefaultValue)
        : ''
  )

  React.useEffect(() => {
    if (isControlled) {
      setInputValue(String(extValue))
    }
  }, [extValue, isControlled])

  const [isFocused, setFocused] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)

  const shouldSuggest = React.useMemo(() => {
    return checkKeyPrefixes(inputValue, mode)
  }, [inputValue, mode])

  const filteredOptions = React.useMemo(() => {
    if (!shouldSuggest) return []
    if (mode === 'onDot') {
      const parts = inputValue.split('.')
      const prefix = parts.slice(0, -1).join('.')
      const current = parts[parts.length - 1] || ''
      const base = prefix ? `${prefix}.` : ''
      return options.filter(
        (o) =>
          o.startsWith(base) &&
          o.slice(base.length).toLowerCase().startsWith(current.toLowerCase())
      )
    }
    return options.filter((o) =>
      o.toLowerCase().includes(inputValue.toLowerCase())
    )
  }, [options, inputValue, shouldSuggest, mode])

  const selectOption = React.useCallback(
    (value: string) => {
      if (!isControlled) {
        setInputValue(value)
      }
      extOnChange?.({
        target: {
          name: restProps.name,
          value,
        },
      } as React.ChangeEvent<HTMLInputElement>)
      setFocused(false)
    },
    [extOnChange, isControlled, restProps.name]
  )

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (filteredOptions.length === 0) return
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setActiveIndex((i) =>
            i === null || i === filteredOptions.length - 1 ? 0 : i + 1
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveIndex((i) =>
            i === null || i === 0 ? filteredOptions.length - 1 : i - 1
          )
          break
        case 'Enter':
        case 'Tab':
          if (activeIndex !== null) {
            e.preventDefault()
            if (filteredOptions[activeIndex]) {
              selectOption(filteredOptions[activeIndex])
            }
          }
          break
        case 'Escape':
          e.preventDefault()
          setFocused(false)
          break
      }
    },
    [filteredOptions, activeIndex, selectOption]
  )

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const changeValue = e.target.value ?? ''
    if (!isControlled) {
      setInputValue(changeValue)
    }
    extOnChange?.(e)
    const shouldFocus = checkKeyPrefixes(changeValue, mode)
    setFocused(shouldFocus)
    setActiveIndex(null)
  }

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    setTimeout(() => setFocused(false), 100)
    extOnBlur?.(e)
  }

  const inputProps = {
    ...restProps,
    value: inputValue,
    onChange: handleChange,
    onFocus: () => setFocused(true),
    onBlur: handleBlur,
    onKeyDown,
    role: 'combobox',
    'aria-expanded': isFocused && filteredOptions.length > 0,
    'aria-activedescendant':
      activeIndex !== null
        ? `typeahead-option-${filteredOptions[activeIndex]}`
        : undefined,
  }

  const dropdownProps = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) =>
      (e.currentTarget.style.background = 'var(--accent-a3)'),
    onMouseDown: (option: string) => selectOption(option),
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) =>
      (e.currentTarget.style.background = 'transparent'),
    style: (idx: number) => ({
      cursor: 'pointer',
      background: idx === activeIndex ? 'var(--accent-a3)' : 'transparent',
      borderRadius: 'var(--radius-2)',
      padding: '.1rem',
    }),
  }

  return {
    inputProps,
    filteredOptions,
    activeIndex,
    dropdownProps,
    selectOption,
    isFocused,
  }
}
