import { Theme } from '@radix-ui/themes'
import { ChevronDownIcon } from 'lucide-react'
import { useState } from 'react'
import {
  type DropdownIndicatorProps,
  MenuProps,
  type StylesConfig,
  components,
} from 'react-select'
import CreatableSelect from 'react-select/creatable'

import { getThemeConfig } from '@/components/StyledReactSelect/StyledReactSelect.styles'

type SuggestionOption = {
  label: string
  value: string
}

interface SuggestionInputProps {
  value: string
  onChange: (value: string) => void
  options: SuggestionOption[]
  disabled?: boolean
  name?: string
  id?: string
}

export function SuggestionInput({
  value,
  onChange,
  options,
  disabled,
  name,
  id,
}: SuggestionInputProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const selectedValue = value
    ? {
        value,
        label: value,
      }
    : null

  return (
    <CreatableSelect<SuggestionOption, false>
      inputId={id}
      name={name}
      isDisabled={disabled}
      menuPlacement="auto"
      menuPosition="fixed"
      menuIsOpen={menuOpen}
      options={options}
      value={selectedValue}
      inputValue={inputValue}
      onFocus={() => !disabled && setMenuOpen(true)}
      onBlur={() => setMenuOpen(false)}
      onMenuOpen={() => setMenuOpen(true)}
      onMenuClose={() => setMenuOpen(false)}
      onInputChange={(nextValue, actionMeta) => {
        if (actionMeta.action === 'input-change') {
          setInputValue(nextValue)
          if (!menuOpen) {
            setMenuOpen(true)
          }
        }
        return nextValue
      }}
      onChange={(option) => onChange(option?.value ?? '')}
      onCreateOption={(nextValue) => {
        onChange(nextValue)
        setInputValue('')
        setMenuOpen(false)
      }}
      formatCreateLabel={(inputValue) => `Use "${inputValue}"`}
      styles={getStylesConfig()}
      theme={getThemeConfig}
      components={{
        IndicatorSeparator: null,
        DropdownIndicator,
        Menu,
      }}
      menuPortalTarget={document.body}
    />
  )
}

function Menu({ ...props }: MenuProps<SuggestionOption>) {
  return (
    <Theme appearance="inherit">
      <components.Menu {...props} />
    </Theme>
  )
}

function DropdownIndicator(props: DropdownIndicatorProps<SuggestionOption>) {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDownIcon />
    </components.DropdownIndicator>
  )
}

function getStylesConfig<Option>(): StylesConfig<Option> {
  return {
    control: (provided, state) => ({
      ...provided,
      height: 'var(--space-5)',
      minHeight: 'auto',
      fontSize: 'var(--font-size-1)',
      boxShadow: state.menuIsOpen ? 'none' : provided.boxShadow,
      borderColor: state.menuIsOpen ? 'var(--gray-a8)' : provided.borderColor,
      '&:hover': {
        borderColor: 'var(--gray-a8)',
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: 0,
      paddingLeft: 'var(--space-1)',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'var(--color-panel-solid)',
      fontSize: 'var(--font-size-1)',
    }),
    menuList: (provided) => ({
      ...provided,
      padding: 'var(--space-1)',
      borderRadius: 'var(--radius-2)',
    }),
    option: (provided, state) => ({
      ...provided,
      background: state.isFocused ? 'var(--accent-9)' : 'transparent',
      color: state.isFocused ? 'var(--accent-contrast)' : undefined,
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      paddingLeft: 'var(--space-4)',
      paddingRight: 'var(--space-4)',
      borderRadius: 'var(--radius-2)',
    }),
  }
}
