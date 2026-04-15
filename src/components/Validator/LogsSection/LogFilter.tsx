import { css } from '@emotion/react'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { Separator } from '@radix-ui/themes'

import { ConsoleFilter, SourcesOptions } from './types'

function isLogSource(value: string) {
  return value === 'browser' || value === 'runtime' || value === 'script'
}

function isLogLevel(value: string) {
  return (
    value === 'debug' ||
    value === 'info' ||
    value === 'warning' ||
    value === 'error'
  )
}

const toggleGroupStyles = css`
  display: flex;
  gap: var(--space-1);
`

const toggleItemStyles = css`
  box-sizing: border-box;
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-2);
  border: none;
  border-radius: var(--radius-2);
  cursor: pointer;
  color: var(--gray-11);
  background-color: transparent;

  &[data-state='on'] {
    background-color: var(--gray-a4);
  }
`

interface LogFilterProps {
  sources: SourcesOptions
  filter: ConsoleFilter
  onChange: (filter: ConsoleFilter) => void
}

export function LogFilter({ sources, filter, onChange }: LogFilterProps) {
  const handleLogLevelsChange = (values: string[]) => {
    onChange({
      ...filter,
      levels: values.filter(isLogLevel),
    })
  }

  const handleLogSourcesChange = (values: string[]) => {
    onChange({
      ...filter,
      sources: values.filter(isLogSource),
    })
  }

  return (
    <>
      <ToggleGroup.Root
        type="multiple"
        value={filter.levels}
        css={toggleGroupStyles}
        aria-label="Filter by log level"
        onValueChange={handleLogLevelsChange}
      >
        <ToggleGroup.Item
          value={'debug'}
          css={toggleItemStyles}
          aria-label={`Filter debug logs`}
        >
          Debug
        </ToggleGroup.Item>
        <ToggleGroup.Item
          value={'info'}
          css={toggleItemStyles}
          aria-label={`Filter info logs`}
        >
          Info
        </ToggleGroup.Item>
        <ToggleGroup.Item
          value={'warning'}
          css={toggleItemStyles}
          aria-label={`Filter warning logs`}
        >
          Warning
        </ToggleGroup.Item>
        <ToggleGroup.Item
          value={'error'}
          css={toggleItemStyles}
          aria-label={`Filter error logs`}
        >
          Error
        </ToggleGroup.Item>
      </ToggleGroup.Root>
      <Separator orientation="vertical" />
      <ToggleGroup.Root
        type="multiple"
        value={filter.sources}
        css={toggleGroupStyles}
        aria-label="Filter by log source"
        onValueChange={handleLogSourcesChange}
      >
        {sources.browser && (
          <ToggleGroup.Item
            value={'browser'}
            css={toggleItemStyles}
            aria-label={`Filter browser logs`}
          >
            Browser
          </ToggleGroup.Item>
        )}
        {sources.script && (
          <ToggleGroup.Item
            value={'script'}
            css={toggleItemStyles}
            aria-label={`Filter script logs`}
          >
            Script
          </ToggleGroup.Item>
        )}
        {sources.runtime && (
          <ToggleGroup.Item
            value={'runtime'}
            css={toggleItemStyles}
            aria-label={`Filter runtime logs`}
          >
            Runtime
          </ToggleGroup.Item>
        )}
      </ToggleGroup.Root>
    </>
  )
}
