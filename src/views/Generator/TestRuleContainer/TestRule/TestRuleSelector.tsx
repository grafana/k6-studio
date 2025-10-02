import { css } from '@emotion/react'
import { Badge, Strong, Text, Tooltip } from '@radix-ui/themes'
import { Link2Icon } from 'lucide-react'
import { useRef } from 'react'

import { useOverflowCheck } from '@/hooks/useOverflowCheck'
import {
  CorrelationRule,
  ParameterizationRule,
  ReplacerSelector,
  TestRule,
} from '@/types/rules'
import { exhaustive } from '@/utils/typescript'

import { CodeSnippetPreview, CustomCodeContent } from './CustomCodeContent'
import { VerificationContent } from './VerificationContent'

interface TestRuleSelectorProps {
  rule: TestRule
}

export function TestRuleSelector({ rule }: TestRuleSelectorProps) {
  const ref = useRef<HTMLDivElement>(null)
  const hasEllipsis = useOverflowCheck(ref)

  return (
    <Tooltip content={<TooltipContent rule={rule} />} hidden={!hasEllipsis}>
      <Badge
        ref={ref}
        color="gray"
        css={css`
          flex-shrink: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: inline-block;
          svg {
            vertical-align: middle;
          }
        `}
      >
        <SelectorContent rule={rule} />
      </Badge>
    </Tooltip>
  )
}

const TooltipContent = ({ rule }: { rule: TestRule }) => {
  return (
    <Text css={{ svg: { verticalAlign: 'middle' } }}>
      <SelectorContent rule={rule} />
    </Text>
  )
}

function SelectorContent({ rule }: { rule: TestRule }) {
  switch (rule.type) {
    case 'correlation':
      return <CorrelationSelectorContent rule={rule} />
    case 'parameterization':
      return <ParameterizationSelectorContent rule={rule} />
    case 'verification':
      return <VerificationContent rule={rule} />
    case 'customCode':
      return <CustomCodeContent rule={rule} />
    default:
      return exhaustive(rule)
  }
}

function CorrelationSelectorContent({ rule }: { rule: CorrelationRule }) {
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
      return <Strong>{new RegExp(selector.regex).toString()}</Strong>
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
          <Link2Icon /> {rule.value.variableName}
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
      return <CodeSnippetPreview snippet={rule.value.code} />
    default:
      return exhaustive(rule.value)
  }
}

function stringFallback(value: string, fallback = '_') {
  return value === '' ? fallback : value
}
