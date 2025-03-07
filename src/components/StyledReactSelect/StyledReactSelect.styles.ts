import { StylesConfig, Theme } from 'react-select'

export function getThemeConfig(theme: Theme) {
  return {
    ...theme,
    spacing: {
      ...theme.spacing,
      baseUnit: 2,
      menuGutter: 2,
    },

    colors: {
      ...theme.colors,
      primary: 'var(--focus-8)', // active border
      primary50: 'var(--accent-9)', // focus item
      primary25: 'var(--accent-9)', // item hover
      neutral0: 'var(--color-surface)', // input background
      neutral20: 'var(--gray-a7)', // border
      neutral30: 'var(--gray-a8)', // border hover
      neutral50: 'var(--gray-a10)', // placeholder
      neutral60: 'var(--gray-12)', // caret
      neutral80: 'var(--gray-12)', // input text
    },
  }
}

export function getStylesConfig<Option>(): StylesConfig<Option> {
  return {
    control: (provided, state) => ({
      ...provided,
      height: 'var(--space-6)',
      minHeight: 'auto',
      paddingLeft: 'var(--space-3)',
      paddingRight: 'var(--space-3)',
      boxShadow: state.menuIsOpen ? 'none' : provided.boxShadow,
      borderColor: state.menuIsOpen ? 'var(--gray-a8)' : provided.borderColor,
      '&:hover': {
        borderColor: 'var(--gray-a8)',
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: 0,
    }),
    singleValue: (provided) => ({
      ...provided,
      margin: 0,
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'var(--color-panel-solid)',
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 40,
    }),
    menuList: (provided) => ({
      ...provided,
      padding: 'var(--space-2)',
      paddingRight: 'var(--space-3)',
    }),
    option: (provided, state) => ({
      ...provided,
      background: state.isFocused ? 'var(--accent-9)' : 'transparent',
      color: state.isFocused ? 'var(--accent-contrast)' : undefined,
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      paddingLeft: 'var(--space-5)',
      paddingRight: 'var(--space-5)',
      borderRadius: 'var(--radius-2)',
    }),
  }
}
