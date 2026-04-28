import { css } from '@emotion/react'
import {
  CodeProps,
  HoverCard,
  Code,
  Box,
  ScrollArea,
  Inset,
} from '@radix-ui/themes'
import { ReactNode } from 'react'

import { Tooltip } from '@/components/primitives/Tooltip'
import { ActionLocator, SerializedValue } from '@/main/runner/schema'
import { BrowserActionLocator } from '@/views/Validator/Browser/BrowserActionLocator'

type ValueProps = CodeProps & {
  tooltip?: string
}

function ValueContainer({ tooltip, ...props }: ValueProps) {
  const content = (
    <Code
      color="gray"
      css={css`
        display: inline-block;
        padding: 4px;
        margin: -4px 0;
        cursor: ${tooltip ? 'pointer' : 'default'};
      `}
      {...props}
    />
  )

  if (!tooltip) {
    return content
  }

  return <Tooltip content={tooltip}>{content}</Tooltip>
}

type HoverValueProps = Omit<ValueProps, 'tooltip'> & {
  enabled?: boolean
  trigger: ReactNode
}

function HoverContainer({
  enabled = true,
  trigger,
  children,
  ...props
}: HoverValueProps) {
  const triggerContent = <ValueContainer {...props}>{trigger}</ValueContainer>

  if (!enabled) {
    return triggerContent
  }

  return (
    <HoverCard.Root>
      <HoverCard.Trigger
        css={css`
          cursor: pointer;
        `}
      >
        {triggerContent}
      </HoverCard.Trigger>
      <HoverCard.Content
        css={css`
          max-height: 300px;
          min-width: 400px;
        `}
      >
        <Inset>
          <ScrollArea>
            <pre
              css={css`
                padding: var(--space-2);
                margin: var(--space-1);
                font-size: var(--font-size-2);
              `}
            >
              <ValueContainer
                css={css`
                  width: 100%;
                `}
              >
                <Box p="2">{children}</Box>
              </ValueContainer>
            </pre>
          </ScrollArea>
        </Inset>
      </HoverCard.Content>
    </HoverCard.Root>
  )
}

function StringValue({ value }: { value: string }) {
  const maxLength = 20

  const trimmed =
    value.length > maxLength ? value.slice(0, maxLength) + '...' : value

  return (
    <HoverContainer
      enabled={value.length > maxLength}
      trigger={`"${trimmed}"`}
    >{`"${value}"`}</HoverContainer>
  )
}

function NumberValue({ value }: { value: number }) {
  return <ValueContainer>{value}</ValueContainer>
}

function BooleanValue({ value }: { value: boolean }) {
  return <ValueContainer weight="bold">{String(value)}</ValueContainer>
}

function NullValue() {
  return <ValueContainer weight="bold">null</ValueContainer>
}

function UndefinedValue() {
  return <ValueContainer weight="bold">undefined</ValueContainer>
}

function ArrayValue({ value }: { value: SerializedValue[] }) {
  return (
    <HoverContainer trigger={'[...]'}>
      {JSON.stringify(value, null, 2)}
    </HoverContainer>
  )
}

function ObjectValue({ value }: { value: Record<string, SerializedValue> }) {
  return (
    <HoverContainer trigger={'{...}'}>
      {JSON.stringify(value, null, 2)}
    </HoverContainer>
  )
}

function DateValue({ timestamp }: { timestamp: number }) {
  return (
    <HoverContainer trigger="Date()" weight="bold">
      Date({new Date(timestamp).toISOString()})
    </HoverContainer>
  )
}

function RegexValue({ pattern, flags }: { pattern: string; flags: string }) {
  return (
    <ValueContainer weight="bold">
      /{pattern}/{flags}
    </ValueContainer>
  )
}

function FunctionValue({ name, source }: { name: string; source: string }) {
  const functionName = name || '<anonymous>'

  return (
    <HoverContainer trigger={`${functionName}(...)`} weight="bold">
      {source}
    </HoverContainer>
  )
}

function SymbolValue({ value }: { value: string }) {
  const match = value.match(/^Symbol\((.*)\)$/)
  const description = match?.[1] ?? value

  return (
    <ValueContainer>
      <strong>Symbol(</strong>
      {description}
      <strong>)</strong>
    </ValueContainer>
  )
}

interface LocatorValueProps {
  locator: ActionLocator
}

function LocatorValue({ locator }: LocatorValueProps) {
  return <BrowserActionLocator locator={locator} />
}

function PageValue() {
  return 'page'
}

interface SerializedValueDisplayProps {
  value: SerializedValue
}

export function Value({ value }: SerializedValueDisplayProps) {
  if (value === null) {
    return <NullValue />
  }

  if (Array.isArray(value)) {
    return <ArrayValue value={value} />
  }

  if (typeof value === 'string') {
    return <StringValue value={value} />
  }

  if (typeof value === 'number') {
    return <NumberValue value={value} />
  }

  if (typeof value === 'boolean') {
    return <BooleanValue value={value} />
  }

  switch (value.type) {
    case 'undefined':
      return <UndefinedValue />

    case 'object':
      return <ObjectValue value={value.value} />

    case 'date':
      return <DateValue timestamp={value.timestamp} />

    case 'regex':
      return <RegexValue pattern={value.pattern} flags={value.flags} />

    case 'function':
      return <FunctionValue name={value.name} source={value.source} />

    case 'symbol':
      return <SymbolValue value={value.value} />

    case 'locator':
      return <LocatorValue locator={value.locator} />

    case 'page':
      return <PageValue />
  }
}
