import { Box, Card, TextField } from '@radix-ui/themes'
import { forwardRef, ComponentProps } from 'react'

import { SuggestionMode, useTypeahead } from './useTypeahead'

export type TypeaheadProps = ComponentProps<typeof TextField.Root> & {
  options: string[]
  mode: SuggestionMode
}

export const Typeahead = forwardRef<HTMLInputElement, TypeaheadProps>(
  (props, ref) => {
    const { options, mode } = props
    const { inputProps, filteredOptions, isFocused, dropdownProps } =
      useTypeahead(options, props, mode)

    return (
      <Box style={{ position: 'relative' }}>
        <TextField.Root {...inputProps} ref={ref} />

        {isFocused && filteredOptions.length > 0 && (
          <Card role="listbox">
            <div
              style={{
                top: '0',
                maxHeight: 'calc(100vh - 200px)',
                left: 0,
                background: 'var(--color-panel)', // automatically switch themes
                overflowY: 'auto',
                right: 0,
                zIndex: 100,
              }}
            >
              {filteredOptions.map((option, idx) => (
                <Box
                  key={option}
                  id={`typeahead-option-${option}`}
                  onMouseEnter={dropdownProps.onMouseEnter}
                  onMouseLeave={dropdownProps.onMouseLeave}
                  onMouseDown={() => dropdownProps.onMouseDown(option)}
                  style={dropdownProps.style(idx)}
                >
                  {option}
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
