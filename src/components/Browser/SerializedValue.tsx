import { css } from '@emotion/react'

import { Tooltip } from '@/components/primitives/Tooltip'
import { SerializedValue } from '@/main/runner/schema'

function StringValue({ value }: { value: string }) {
  return (
    <Tooltip content={`"${value}"`}>
      <code>string</code>
    </Tooltip>
  )
}

function NumberValue({ value }: { value: number }) {
  return (
    <Tooltip content={String(value)}>
      <code>number</code>
    </Tooltip>
  )
}

function BooleanValue({ value }: { value: boolean }) {
  return (
    <Tooltip content={String(value)}>
      <code>boolean</code>
    </Tooltip>
  )
}

function NullValue() {
  return (
    <Tooltip content="null">
      <code>null</code>
    </Tooltip>
  )
}

function UndefinedValue() {
  return (
    <Tooltip content="undefined">
      <code>undefined</code>
    </Tooltip>
  )
}

function ArrayValue({ value }: { value: SerializedValue[] }) {
  return (
    <Tooltip content={JSON.stringify(value, null, 2)}>
      <code>array</code>
    </Tooltip>
  )
}

function ObjectValue({ value }: { value: Record<string, SerializedValue> }) {
  return (
    <Tooltip
      css={css`
        max-width: 200px;
      `}
      content={JSON.stringify(value, null, 2)}
    >
      <code
        css={css`
          display: block;
          max-width: 200px;
          white-space: pre-wrap;
        `}
      >
        object
      </code>
    </Tooltip>
  )
}

function DateValue({ timestamp }: { timestamp: number }) {
  return (
    <Tooltip content={new Date(timestamp).toISOString()}>
      <code>date</code>
    </Tooltip>
  )
}

function RegexValue({ pattern, flags }: { pattern: string; flags: string }) {
  return (
    <Tooltip content={`/${pattern}/${flags}`}>
      <code>regex</code>
    </Tooltip>
  )
}

function FunctionValue({ name, source }: { name: string; source: string }) {
  return (
    <Tooltip content={source}>
      <code>function {name}</code>
    </Tooltip>
  )
}

function SymbolValue({ value }: { value: string }) {
  return (
    <Tooltip content={value}>
      <code>symbol</code>
    </Tooltip>
  )
}

function LocatorValue() {
  return (
    <Tooltip content="Locator">
      <code>locator</code>
    </Tooltip>
  )
}

function PageValue() {
  return (
    <Tooltip content="Page">
      <code>page</code>
    </Tooltip>
  )
}

interface SerializedValueDisplayProps {
  value: SerializedValue
}

export function SerializedValueDisplay({ value }: SerializedValueDisplayProps) {
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
      return <LocatorValue />

    case 'page':
      return <PageValue />
  }
}
