import * as React from 'react'

import type {
  TypeaheadConfig,
  TypeaheadProps,
} from '@/views/Generator/RuleEditor/Typeahead/Typeahead'

/**
 * Temporary feature flagging, we can use this to experiment with different use cases
 *
 * onDot: Will render suggestions on the first dot
 * onFirstKey: will render suggestions on the first key (unoptimized: WARNING DO NOT USE IN PRODUCTION UNTIL LAZY LOADING IS BUILT)
 * onThirdKey: will render suggestions on the third key
 */
export type SuggestionMode = 'onDot' | 'onFirstKey' | 'onThirdKey'
type OptionsQuery = {
  data: string[]
  isLoading: boolean
  isError: boolean
}
type ExternalProps = Omit<TypeaheadProps, 'mode'>
const defaultSuggestionMode: SuggestionMode = 'onDot'
const defaultDropDownLimit = 50

function checkKeyPrefixes(value: string, mode: SuggestionMode) {
  if (mode === 'onDot') return value.includes('.')
  if (mode === 'onFirstKey') return value.length >= 1
  if (mode === 'onThirdKey') return value.length >= 3
  return false
}

export function useTypeahead(config: TypeaheadConfig, props: ExternalProps) {
  const {
    value: extValue,
    defaultValue: extDefaultValue,
    onChange: extOnChange,
    onBlur: extOnBlur,
    ...restProps
  } = props
  const {
    mode = defaultSuggestionMode,
    getOptions,
    optionsLimit = defaultDropDownLimit,
  } = config

  const [optionsQuery, setOptionsQuery] = React.useState<OptionsQuery>({
    data: [],
    isLoading: false,
    isError: false,
  })

  const requestIdRef = React.useRef(0)
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

  const debounceMs = 120

  React.useEffect(() => {
    if (!shouldSuggest) {
      setOptionsQuery({ data: [], isLoading: false, isError: false })
      return
    }

    const requestId = ++requestIdRef.current

    const timer = setTimeout(() => {
      setOptionsQuery((prev) => ({ ...prev, isLoading: true, isError: false }))

      getOptions({ query: inputValue, mode, limit: optionsLimit })
        .then((next) => {
          if (requestId !== requestIdRef.current) return
          setOptionsQuery({
            data: next ?? [],
            isLoading: false,
            isError: false,
          })
          setActiveIndex(null)
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) return
          setOptionsQuery({ data: [], isLoading: false, isError: true })
          setActiveIndex(null)
        })
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [getOptions, inputValue, mode, optionsLimit, shouldSuggest])

  const filteredOptions = React.useMemo(() => {
    if (!shouldSuggest) return []
    return getOptions({
      query: inputValue,
      mode: mode,
      limit: optionsLimit,
    })
  }, [inputValue, shouldSuggest, mode, getOptions, optionsLimit])

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
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      const filteredOptionsValue = await filteredOptions
      if (filteredOptionsValue.length === 0) return
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setActiveIndex((i) =>
            i === null || i === filteredOptionsValue.length - 1 ? 0 : i + 1
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveIndex((i) =>
            i === null || i === 0 ? filteredOptionsValue.length - 1 : i - 1
          )
          break
        case 'Enter':
        case 'Tab':
          if (activeIndex !== null) {
            e.preventDefault()
            if (filteredOptionsValue[activeIndex]) {
              selectOption(filteredOptionsValue[activeIndex])
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

  const isOptionsAvailable = optionsQuery.data && optionsQuery.data.length > 0

  const inputProps = {
    ...restProps,
    value: inputValue,
    onChange: handleChange,
    onFocus: () => setFocused(true),
    onBlur: handleBlur,
    onKeyDown,
    role: 'combobox',
    'aria-expanded': isFocused && isOptionsAvailable,
    'aria-activedescendant':
      activeIndex && isOptionsAvailable !== null
        ? `typeahead-option-${optionsQuery.data[activeIndex]}`
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
    activeIndex,
    optionsQuery,
    dropdownProps,
    selectOption,
    isFocused,
  }
}
