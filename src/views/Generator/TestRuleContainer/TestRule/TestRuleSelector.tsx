import { css } from '@emotion/react'
import { Link1Icon } from '@radix-ui/react-icons'
import { Badge, Strong, Tooltip } from '@radix-ui/themes'
import { useRef } from 'react'

import { useOverflowCheck } from '@/hooks/useOverflowCheck'
import {
  CorrelationRule,
  ParameterizationRule,
  ReplacerSelector,
} from '@/types/rules'
import { exhaustive } from '@/utils/typescript'

interface TestRuleSelectorProps {
  rule: CorrelationRule | ParameterizationRule
}

export function TestRuleSelector({ rule }: TestRuleSelectorProps) {
  const ref = useRef<HTMLDivElement>(null)
  const hasEllipsis = useOverflowCheck(ref)

  return (
    <Tooltip content={<SelectorContent rule={rule} />} hidden={!hasEllipsis}>
      <Badge
        ref={ref}
        color="gray"
        css={css`
          flex-shrink: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: inline-block;
        `}
      >
        <SelectorContent rule={rule} />
      </Badge>
    </Tooltip>
  )
}

function SelectorContent({
  rule,
}: {
  rule: CorrelationRule | ParameterizationRule
}) {
  switch (rule.type) {
    case 'correlation':
      return <CorrelationSelectorContetent rule={rule} />
    case 'parameterization':
      return <ParameterizationSelectorContent rule={rule} />
    default:
      return exhaustive(rule)
  }
}

function CorrelationSelectorContetent({ rule }: { rule: CorrelationRule }) {
  return (
    <>
      Correlate <SelectorLabel selector={rule.extractor.selector} /> from{' '}
      {rule.extractor.selector.from}
    </>
  )
}

function ParameterizationSelectorContent({
  rule,
}: {
  rule: ParameterizationRule
}) {
  return (
    <>
      Replace <SelectorLabel selector={rule.selector} /> in {rule.selector.from}{' '}
      with <ParameterizationValue rule={rule} />
    </>
  )
}

function SelectorLabel({ selector }: { selector: ReplacerSelector }) {
  switch (selector.type) {
    case 'json':
      return (
        <Strong>
          {'{  }'} {stringFallback(selector.path)}
        </Strong>
      )
    case 'begin-end':
      return (
        <>
          between <Strong>{stringFallback(selector.begin)}</Strong> and{' '}
          <Strong>{stringFallback(selector.end)}</Strong>
        </>
      )
    case 'regex':
      return (
        <>
          <Strong>(.*) {stringFallback(selector.regex)}</Strong>
        </>
      )
    case 'header-name':
      return <Strong>{stringFallback(selector.name)}</Strong>
    case 'text':
      return <Strong>{stringFallback(selector.value)}</Strong>
    default:
      return exhaustive(selector)
  }
}

function ParameterizationValue({ rule }: { rule: ParameterizationRule }) {
  switch (rule.value.type) {
    case 'string':
      return <Strong>{stringFallback(rule.value.value)}</Strong>
    case 'variable':
      return (
        <Strong css={{ whiteSpace: 'nowrap' }}>
          <Link1Icon css={{ verticalAlign: 'middle', display: 'inline' }} />{' '}
          {rule.value.variableName}
        </Strong>
      )
    case 'dataFileValue':
      return (
        <>
          <Strong>{rule.value.propertyName}</Strong> from{' '}
          <Strong>{rule.value.fileName}</Strong>
        </>
      )
    case 'customCode':
      return null
    default:
      return exhaustive(rule.value)
  }
}

function stringFallback(value: string, fallback = '_') {
  return value === '' ? fallback : value
}
