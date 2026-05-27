import { css } from '@emotion/react'
import { ChevronDownIcon, ThickCheckIcon } from '@radix-ui/themes'
import { ComponentProps, useMemo } from 'react'
import Select, { components, GroupBase, OptionProps } from 'react-select'

import { getStylesConfig, getThemeConfig } from './StyledReactSelect.styles'

export function StyledReactSelect<
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(props: ComponentProps<typeof Select<Option, IsMulti, Group>>) {
  const styles = useMemo(() => getStylesConfig<Option, IsMulti, Group>(), [])

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
