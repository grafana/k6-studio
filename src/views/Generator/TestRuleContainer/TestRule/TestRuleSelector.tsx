import { Badge, Code, Tooltip } from '@radix-ui/themes'
import { css } from '@emotion/react'

import { CorrelationRule, ParameterizationRule, Selector } from '@/types/rules'
import { exhaustive } from '@/utils/typescript'
import { useOverflowCheck } from '@/hooks/useOverflowCheck'
import { useRef } from 'react'
import { Link1Icon } from '@radix-ui/react-icons'

interface TestRuleSelectorProps {
  rule: CorrelationRule | ParameterizationRule
}

// TODO: split file
export function TestRuleSelector({ rule }: TestRuleSelectorProps) {
  const ref = useRef<HTMLDivElement>(null)
  const hasEllipsis = useOverflowCheck(ref)

  return (
    <Tooltip
      content={
        <>
          <SelectorContent rule={rule} />
        </>
      }
      hidden={!hasEllipsis}
    >
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

function SelectorLabel({ selector }: { selector: Selector }) {
  switch (selector.type) {
    case 'json':
      return (
        <>
          <Code>{selector.path}</Code>
        </>
      )
    case 'begin-end':
      return (
        <>
          between <Code>{selector.begin}</Code> and <Code>{selector.end}</Code>
        </>
      )
    case 'regex':
      return (
        <>
          <Code>(.*) {selector.regex}</Code>
        </>
      )
    default:
      return exhaustive(selector)
  }
}

function CorrelationSelectorContetent({ rule }: { rule: CorrelationRule }) {
  return (
    <>
      <SelectorLabel selector={rule.extractor.selector} /> from{' '}
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
      replace <SelectorLabel selector={rule.selector} /> in {rule.selector.from}{' '}
      with <ParameterizationValue rule={rule} />
    </>
  )
}

function ParameterizationValue({ rule }: { rule: ParameterizationRule }) {
  switch (rule.value.type) {
    case 'string':
      return (
        <Code color="orange">
          {rule.value.value === '' ? '-' : rule.value.value}
        </Code>
      )
    case 'variable':
      return (
        <Code color="orange" css={{ whiteSpace: 'nowrap' }}>
          <Link1Icon css={{ verticalAlign: 'middle', display: 'inline' }} />{' '}
          {rule.value.variableName}
        </Code>
      )
    case 'array':
    case 'customCode':
      return null
    default:
      return exhaustive(rule.value)
  }
}
