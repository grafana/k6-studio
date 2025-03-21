import { css } from '@emotion/react'
import { ChevronDownIcon, ThickCheckIcon } from '@radix-ui/themes'
import { ComponentProps, useMemo } from 'react'
import Select, { components, OptionProps } from 'react-select'

import { getStylesConfig, getThemeConfig } from './StyledReactSelect.styles'

export function StyledReactSelect<Option>(
  props: ComponentProps<typeof Select<Option>>
) {
  const styles = useMemo(() => getStylesConfig<Option>(), [])

  return (
    <div css={{ fontSize: 'var(--font-size-2)' }}>
      <Select
        menuPlacement="auto"
        menuPosition="fixed"
        styles={styles}
        components={{
          IndicatorSeparator: null,
          DropdownIndicator: DropdownIndicator,
          Option: OptionComponent<Option>,
        }}
        theme={getThemeConfig}
        {...props}
      />
    </div>
  )
}

function OptionComponent<Option>({ children, ...props }: OptionProps<Option>) {
  return (
    <components.Option {...props}>
      <div
        css={{
          position: 'absolute',
          left: 0,
          width: 'var(--space-5)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {props.isSelected && <ThickCheckIcon />}
      </div>
      <div
        css={css`
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        `}
      >
        {children}
      </div>
    </components.Option>
  )
}

function DropdownIndicator() {
  return <ChevronDownIcon className="rt-SelectIcon" />
}
