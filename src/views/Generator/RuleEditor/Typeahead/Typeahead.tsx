import { Box, Card, TextField } from '@radix-ui/themes'
import * as React from 'react'
import { ComponentProps } from 'react'

import { SuggestionMode, useTypeahead } from './useTypeahead'

export type TypeaheadProps = ComponentProps<typeof TextField.Root> & {
  options: string[]
  mode: SuggestionMode
}

export const Typeahead = React.forwardRef<HTMLInputElement, TypeaheadProps>(
  (props, ref) => {
    const { options, mode } = props
    const { inputProps, filteredOptions, isFocused, dropdownProps } =
      useTypeahead(options, props, mode)

    return (
      <Box style={{ position: 'relative' }}>
        <TextField.Root {...inputProps} ref={ref} />

        {isFocused && filteredOptions.length > 0 && (
          <Card
            role="listbox"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              maxHeight: '10em',
              background: 'white',
              overflowY: 'auto',
              right: 0,
              zIndex: 100,
            }}
          >
            {filteredOptions.map((option, idx) => (
              <Box
                id={`typeahead-option-${option}`}
                key={option}
                as="div"
                onMouseEnter={dropdownProps.onMouseEnter}
                onMouseLeave={dropdownProps.onMouseLeave}
                onMouseDown={() => dropdownProps.onMouseDown(option)}
                style={dropdownProps.style(idx)}
              >
                {option}
              </Box>
            ))}
          </Card>
        )}
      </Box>
    )
  }
)

Typeahead.displayName = 'Typeahead'
