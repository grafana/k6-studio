import { Box, Card, Text, TextField } from '@radix-ui/themes'
import { ComponentProps, forwardRef, useLayoutEffect, useRef } from 'react'

import { SuggestionMode, useTypeahead } from './useTypeahead'

export type TypeaheadGetOptionsRequest = {
  /**
   * Query for suggestions
   */
  query: string
  /**
   * suggestion mode can be one of following:  onDot, onFirstKey, onThirdKey
   */
  mode: SuggestionMode
  /**
   * Limit the number of suggestions
   */
  limit: number
}
export type TypeaheadGetOptions = (
  args: TypeaheadGetOptionsRequest
) => Promise<string[]>
export type TypeaheadConfig = {
  /**
   * suggestion mode can be one of following:  onDot, onFirstKey, onThirdKey
   */
  mode: SuggestionMode
  /**
   * Async function that retrieves data lazily
   */
  getOptions: TypeaheadGetOptions
  /**
   * Optional limit per async invocation of getOptions
   */
  optionsLimit?: number
}

export type TypeaheadProps = ComponentProps<typeof TextField.Root> &
  TypeaheadConfig

export const Typeahead = forwardRef<HTMLInputElement, TypeaheadProps>(
  (props, ref) => {
    const { getOptions, optionsLimit = 50, mode } = props
    const { inputProps, isFocused, dropdownProps, activeIndex, optionsQuery } =
      useTypeahead(
        {
          getOptions,
          optionsLimit,
          mode,
        },
        props
      )

    const optionRefs = useRef<Array<HTMLDivElement | null>>([])
    const isOptionIndexSelected =
      optionRefs.current && activeIndex && optionRefs.current[activeIndex]
    const isOptionsAvailable =
      !optionsQuery.isLoading &&
      !optionsQuery.isError &&
      optionsQuery.data &&
      optionsQuery.data.length > 0

    useLayoutEffect(() => {
      if (!isOptionIndexSelected) {
        return
      }
      const el = optionRefs.current[activeIndex]
      if (!el) return

      el.scrollIntoView({ block: 'nearest' })
    }, [isOptionIndexSelected, activeIndex])

    return (
      <Box style={{ position: 'relative' }}>
        <TextField.Root {...inputProps} ref={ref} />

        {isFocused && isOptionsAvailable && (
          <Card role="listbox">
            <div
              style={{
                maxHeight: '200px',
                overflowY: 'auto',
                background: 'var(--color-panel)',
                zIndex: 100,
              }}
            >
              {optionsQuery.data.map((option, idx) => (
                <Box
                  key={option}
                  ref={(node) => {
                    optionRefs.current[idx] = node as unknown as HTMLDivElement
                  }}
                  id={`typeahead-option-${option}`}
                  onMouseEnter={dropdownProps.onMouseEnter}
                  onMouseLeave={dropdownProps.onMouseLeave}
                  onMouseDown={() => dropdownProps.onMouseDown(option)}
                  style={dropdownProps.style(idx)}
                >
                  <Text size="2">{option}</Text>
                </Box>
              ))}
            </div>
          </Card>
        )}
      </Box>
    )
  }
)

Typeahead.displayName = 'Typeahead'
